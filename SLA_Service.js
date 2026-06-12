/*************************************************
 * SLA ENGINE SERVICE - FULL VERSION
 * SOURCE:
 * 08_M_SLA
 * 81_T_WORKFLOW_HISTORY
 *************************************************/

const DEBUG = true;

/* =========================
   MAIN ENGINE
========================= */

function getSLAEngine(){

  const history = getSheetData("81_T_WORKFLOW_HISTORY");
  const sla = getSheetData("08_M_SLA");

  const slaMap = buildSlaMap(sla);
  const result = calculateSLAFromHistory(history, slaMap);

  if(DEBUG){
    console.log("=== SLA MAP ===");
    console.log(slaMap);

    console.log("=== SLA RESULT ===");
    console.log(result);
  }

  return result;

}

/* =========================
   BUILD SLA MAP
========================= */

function buildSlaMap(data){

  const map = {};

  for(let i = 1; i < data.length; i++){

    const row = data[i];

    const step = row[2]; // step_code
    const slaDays = row[8]; // sla_days

    if(step){

      map[step.toString().trim()] = Number(slaDays || 0);

    }

  }

  return map;

}

// function buildSlaMap(data){

//   const map = {};

//   for(let i=1; i<data.length; i++){

//     const row = data[i];

//     const stepCode =
//       row[2]; // step_code

//     const slaHour =
//       Number(row[7] || 0); // sla_hours

//     if(stepCode){

//       map[
//         stepCode.toString().trim()
//       ] = slaHour;

//     }

//   }

//   return map;

// }

/* =========================
   SLA CALCULATION ENGINE
========================= */

function calculateSLAFromHistory(history, slaMap){

  const result = {};

  for(let i = 1; i < history.length; i++){

    const row = history[i];

    const step = row[3]; // step_name
    const durationHour = Number(row[6] || 0);

    if(!step || isNaN(durationHour)) continue;

    const key = step.toString().trim();
    const slaDay = slaMap[key] || 0;

    const durationDay = durationHour / 24;

    if(!result[key]){

      result[key] = {
        total: 0,
        onTime: 0,
        late: 0,
        totalDuration: 0
      };

    }

    result[key].total++;
    result[key].totalDuration += durationHour;

    if(durationDay <= slaDay){
      result[key].onTime++;
    } else {
      result[key].late++;
    }

  }

  // FINAL CALCULATION
  Object.keys(result).forEach(step => {

    const r = result[step];

    r.avgDuration = r.total ? r.totalDuration / r.total : 0;

    r.performance = r.total
      ? (r.onTime / r.total) * 100
      : 0;

    r.status =
      r.performance >= 90 ? "GOOD"
      : r.performance >= 70 ? "WARNING"
      : "BREACH";

  });

  return result;

}

/* =========================
   TEST SERVER SIDE
========================= */

function testSLA(){

  const result = getSLAEngine();
  Logger.log(result);

}

/* =========================
   TEST CLIENT CONSOLE
========================= */

function testConsole(){

  google.script.run
    .withSuccessHandler(function(res){

      console.log("=== SLA ENGINE RESULT ===");
      console.table(res);

    })
    .getSLAEngine();

}

/* =========================
   DEBUG ALL DATA
========================= */

function debugAll(){

  google.script.run
    .withSuccessHandler(res => {

      console.log("=== FULL SLA DEBUG ===");
      console.table(res);

    })
    .getSLAEngine();

}

/* =========================
   SLA DATA
========================= */
function getSLADashboardData(){

  const history =
    getSheetData("81_T_WORKFLOW_HISTORY");

  const sla =
    getSheetData("08_M_SLA");

  const slaMap =
    buildSlaMap(sla);

  const result = {};

  for(let i=1;i<history.length;i++){

    const row = history[i];

    const step =
      row[3];

    const durationHour =
      Number(row[6]);

    if(!step) continue;

    // const target =
    //   slaMap[step] || 0;
    const slaCode =
      STEP_TO_SLA[step];

    const target =
      slaMap[slaCode] || 0;

    if(!result[step]){

      result[step] = {

        process_code: step,

        total:0,
        on_time:0,
        delay:0,

        total_duration:0,
        target: target

      };

    }

    result[step].total++;

    result[step].total_duration +=
      durationHour;

    if(durationHour <= target){

      result[step].on_time++;

    }else{

      result[step].delay++;

    }

  }

  return Object.values(result)
    .map(r => ({

      process_code:
        r.process_code,

      target:
        r.target,

      actual:
        r.total_duration / r.total,

      sla_compliance_percent:
        r.total
          ? (r.on_time / r.total) * 100
          : 0

    }));

}