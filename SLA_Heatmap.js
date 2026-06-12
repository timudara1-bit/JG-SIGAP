function getSLAHeatmap(){

  // 1. ambil hasil SLA engine
  const slaResult = getSLAEngine();

  const heatmap = [];

  Object.keys(slaResult).forEach(step => {

    const data = slaResult[step];

    const performance = data.performance || 0;

    let status = "GREEN";

    if(performance < 70){
      status = "RED";
    } else if(performance < 90){
      status = "YELLOW";
    }

    heatmap.push({

      step: step,

      total: data.total,
      onTime: data.onTime,
      late: data.late,

      avgDuration: Number(data.avgDuration.toFixed(2)),

      performance: Number(performance.toFixed(2)),

      status: status

    });

  });

  // optional: sorting paling buruk ke paling bagus
  heatmap.sort((a, b) => a.performance - b.performance);

  return heatmap;

}