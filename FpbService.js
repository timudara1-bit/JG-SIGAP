/*************************************************
 * FPB SERVICE - V7.4
 *************************************************/
class FPBService {


  static getLookupMaps_() {
    const empMap = {};
    const deptMap = {};
    const compMap = {};

    Repository.safeGetAll(CONFIG.SHEET.EMPLOYEE).forEach(function(e) {
      const id = e.employee_id || "";
      if (!id) return;
      empMap[id] = {
        employee_id: id,
        nik: e.nik || "",
        full_name: e.full_name || e.nama_lengkap || e.nama || e.name || id,
        email: e.email || ""
      };
    });

    Repository.safeGetAll(CONFIG.SHEET.DEPARTMENT).forEach(function(d) {
      const id = d.department_id || d.dept_id || "";
      if (!id) return;
      deptMap[id] = {
        department_id: id,
        department_code: d.department_code || d.dept_code || d.code || id,
        department_name: d.department_name || d.name || d.department || id,
        company_id: d.company_id || ""
      };
    });

    if (Repository.exists(CONFIG.SHEET.COMPANY)) {
      Repository.safeGetAll(CONFIG.SHEET.COMPANY).forEach(function(c) {
        const id = c.company_id || "";
        if (!id) return;
        compMap[id] = {
          company_id: id,
          company_code: c.company_code || c.company_kode || c.kode_company || id,
          company_name: c.company_name || c.name || id
        };
      });
    }

    return { empMap: empMap, deptMap: deptMap, compMap: compMap };
  }

  static safeDateString_(value) {
    if (!value) return "";
    try {
      if (Object.prototype.toString.call(value) === "[object Date]") {
        return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      return String(value);
    } catch (err) {
      return String(value || "");
    }
  }

  static getInitData(payload, user) {
    return {
      success: true,
      data: {
        fpbs: this.list(payload || {}, user).data || [],
        departments: this.getSimple_(CONFIG.SHEET.DEPARTMENT, "department_id", ["department_name", "name", "department"]),
        companies: this.getSimple_(CONFIG.SHEET.COMPANY, "company_id", ["company_code", "company_name", "name"]),
        uoms: this.getUOMOptions_()
      }
    };
  }

  static searchEmployees(payload, user) {
    const q = String(payload.q || payload.search || "").toLowerCase().trim();
    if (q.length < 2) return { success: true, data: [], total: 0 };

    const rows = this.getEmployees_().filter(function(r) {
      return [r.employee_id, r.nik, r.full_name, r.department_id, r.department_code, r.company_id, r.email]
        .join(" ").toLowerCase().indexOf(q) !== -1;
    }).slice(0, Number(payload.limit || 20));

    return { success: true, data: rows, total: rows.length };
  }

  static previewNumber(payload, user) {
    return {
      success: true,
      data: {
        fpb_no: this.generateFpbNo_(payload.department_id, payload.company_id, payload.fpb_date || new Date())
      }
    };
  }

  static list(payload, user) {
    try {
      const search = String((payload && payload.search) || "").toLowerCase();
      const maps = this.getLookupMaps_();

      let rows = Repository.safeGetAll(CONFIG.SHEET.FPB_HEADER);

      rows = rows.map(function(r) {
        const requesterId = r.requester_id || "";
        const deptId = r.department_id || "";
        const companyId = r.company_id || "";

        const emp = maps.empMap[requesterId] || {};
        const dept = maps.deptMap[deptId] || {};
        const comp = maps.compMap[companyId] || {};

        const requesterName = r.requester_name || emp.full_name || requesterId;
        const requesterLabel = requesterName
          ? requesterName + (emp.nik ? " (" + emp.nik + ")" : "")
          : requesterId;

        const departmentName = dept.department_name || deptId;
        const departmentCode = dept.department_code || deptId;
        const departmentLabel = departmentCode && departmentName && departmentCode !== departmentName
          ? departmentCode + " - " + departmentName
          : departmentName;

        const companyCode = comp.company_code || companyId;
        const companyName = comp.company_name || companyId;
        const companyLabel = companyCode && companyName && companyCode !== companyName
          ? companyCode + " - " + companyName
          : companyName;

        return {
          fpb_id: r.fpb_id || "",
          fpb_no: r.fpb_no || "",
          fpb_date: FPBService.safeDateString_(r.fpb_date || r.request_date || ""),
          requester_id: requesterId,
          requester_name: requesterName,
          requester_label: requesterLabel,
          department_id: deptId,
          department_code: departmentCode,
          department_name: departmentName,
          department_label: departmentLabel,
          company_id: companyId,
          company_code: companyCode,
          company_name: companyName,
          company_label: companyLabel,
          priority: r.priority || "NORMAL",
          purpose: r.purpose || r.description || "",
          status: r.status || "DRAFT"
        };
      });

      if (search) rows = rows.filter(function(r) {
        return JSON.stringify(r).toLowerCase().indexOf(search) !== -1;
      });

      return { success: true, data: rows, total: rows.length };
    } catch (err) {
      return { success: false, message: "Gagal load FPB: " + (err.message || err), data: [] };
    }
  }




  static getActiveEsignByEmployee_(employeeId) {
    try {
      const sheetName = (CONFIG.SHEET && CONFIG.SHEET.EMPLOYEE_ESIGN) || "24_M_EMPLOYEE_ESIGN";
      if (!Repository.exists(sheetName)) return null;
      const rows = Repository.safeGetAll(sheetName).filter(function(r) {
        const active = String(r.is_active !== undefined ? r.is_active : "1").toUpperCase();
        return String(r.employee_id || "") === String(employeeId || "") &&
          (active === "1" || active === "TRUE" || active === "ACTIVE");
      });
      return rows.length ? rows[rows.length - 1] : null;
    } catch (err) {
      return null;
    }
  }


  static getDetail(payload, user) {
    try {
      payload = payload || {};
      const fpbId = String(payload.fpb_id || "").trim();
      const fpbNo = String(payload.fpb_no || "").trim();

      if (!fpbId && !fpbNo) {
        return { success: false, message: "Parameter fpb_id / fpb_no wajib dikirim." };
      }

      const headers = Repository.safeGetAll(CONFIG.SHEET.FPB_HEADER);
      const detailRows = Repository.safeGetAll(CONFIG.SHEET.FPB_DETAIL);
      const maps = this.getLookupMaps_();

      const headerRaw = headers.find(function(r) {
        return (fpbId && String(r.fpb_id || "") === fpbId) || (fpbNo && String(r.fpb_no || "") === fpbNo);
      });

      if (!headerRaw) {
        return { success: false, message: "Data FPB tidak ditemukan." };
      }

      const requesterId = headerRaw.requester_id || "";
      const deptId = headerRaw.department_id || "";
      const companyId = headerRaw.company_id || "";

      const emp = maps.empMap[requesterId] || {};
      const dept = maps.deptMap[deptId] || {};
      const comp = maps.compMap[companyId] || {};

      const requesterName = headerRaw.requester_name || emp.full_name || requesterId;
      const requesterLabel = requesterName
        ? requesterName + (emp.nik ? " (" + emp.nik + ")" : "")
        : requesterId;

      const activeRequesterEsign = FPBService.getActiveEsignByEmployee_(requesterId) || {};

      const departmentName = dept.department_name || deptId;
      const departmentCode = dept.department_code || deptId;
      const departmentLabel = departmentCode && departmentName && departmentCode !== departmentName
        ? departmentCode + " - " + departmentName
        : departmentName;

      const companyCode = comp.company_code || companyId;
      const companyName = comp.company_name || companyId;
      const companyLabel = companyCode && companyName && companyCode !== companyName
        ? companyCode + " - " + companyName
        : companyName;

      const header = {
        fpb_id: headerRaw.fpb_id || "",
        fpb_no: headerRaw.fpb_no || "",
        fpb_date: FPBService.safeDateString_(headerRaw.fpb_date || headerRaw.request_date || ""),
        requester_id: requesterId,
        requester_name: requesterName,
        requester_label: requesterLabel,
        department_id: deptId,
        department_code: departmentCode,
        department_name: departmentName,
        department_label: departmentLabel,
        company_id: companyId,
        company_code: companyCode,
        company_name: companyName,
        company_label: companyLabel,
        cost_center_id: headerRaw.cost_center_id || "",
        priority: headerRaw.priority || "NORMAL",
        purpose: headerRaw.purpose || headerRaw.description || "",
        remarks: headerRaw.remarks || "",
        requester_esign: headerRaw.requester_esign || activeRequesterEsign.esign_id || "",
        requester_esign_id: headerRaw.requester_esign_id || activeRequesterEsign.esign_id || "",
        requester_esign_url: headerRaw.requester_esign_url || activeRequesterEsign.file_url || activeRequesterEsign.file_data_url || "",
        status: headerRaw.status || "DRAFT",
        current_step: headerRaw.current_step || "",
        created_at: FPBService.safeDateString_(headerRaw.created_at || ""),
        created_by: headerRaw.created_by || "",
        updated_at: FPBService.safeDateString_(headerRaw.updated_at || ""),
        updated_by: headerRaw.updated_by || ""
      };

      const details = detailRows
        .filter(function(d) {
          return String(d.fpb_id || "") === String(header.fpb_id || "") ||
                 String(d.fpb_no || "") === String(header.fpb_no || "");
        })
        .map(function(d, idx) {
          const qty = FPBService.toNumber_(d.qty);
          const price = FPBService.toNumber_(d.estimated_price || d.unit_price || d.price);
          const total = FPBService.toNumber_(d.estimated_total || d.total_price || d.amount) || (qty * price);

          return {
            no: idx + 1,
            fpb_detail_id: d.fpb_detail_id || "",
            item_code: d.item_code || "",
            item_name: d.item_name || "",
            item_description: d.item_description || d.specification || "",
            category_id: d.category_id || "",
            qty: qty,
            uom: d.uom || "",
            estimated_price: price,
            estimated_total: total,
            remarks: d.remarks || ""
          };
        });

      const summary = {
        item_count: details.length,
        total_qty: details.reduce(function(a, b) { return a + FPBService.toNumber_(b.qty); }, 0),
        total_amount: details.reduce(function(a, b) { return a + FPBService.toNumber_(b.estimated_total); }, 0)
      };

      const attachments = Repository.exists(CONFIG.SHEET.DOCUMENT_ATTACHMENT || "78_T_DOCUMENT_ATTACHMENT")
        ? Repository.safeGetAll(CONFIG.SHEET.DOCUMENT_ATTACHMENT || "78_T_DOCUMENT_ATTACHMENT").filter(function(a) {
            return String(a.document_id || "") === String(header.fpb_id || "") ||
                   String(a.document_no || "") === String(header.fpb_no || "");
          }).map(function(a) {
            return {
              attachment_id: a.attachment_id || "",
              file_name: a.file_name || "",
              file_type: a.file_type || "",
              file_url: a.file_url || "",
              file_size: a.file_size || "",
              attachment_category: a.attachment_category || "",
              uploaded_by: a.uploaded_by || "",
              uploaded_at: FPBService.safeDateString_(a.uploaded_at || "")
            };
          })
        : [];

      const approvals = Repository.exists(CONFIG.SHEET.APPROVAL || "80_T_APPROVAL")
        ? Repository.safeGetAll(CONFIG.SHEET.APPROVAL || "80_T_APPROVAL").filter(function(a) {
            return String(a.document_id || "") === String(header.fpb_id || "");
          }).map(function(a) {
            return {
              approval_id: a.approval_id || "",
              step_code: a.step_code || "",
              approval_level: a.approval_level || "",
              approver_role: a.approver_role || "",
              approver_user_id: a.approver_user_id || "",
              approval_status: a.approval_status || "",
              approval_date: FPBService.safeDateString_(a.approval_date || ""),
              remarks: a.remarks || ""
            };
          })
        : [];

      return {
        success: true,
        data: {
          header: header,
          details: details,
          attachments: attachments,
          approvals: approvals,
          summary: summary
        }
      };
    } catch (err) {
      return { success: false, message: "Gagal load detail FPB: " + (err.message || err) };
    }
  }


  static create(payload, user) {
    const header = (payload && payload.header) || {};
    const details = ((payload && payload.details) || []).filter(d => String(d.item_name || "").trim() !== "");

    if (!header.requester_id) return { success: false, message: "Requester wajib dipilih." };
    if (!header.department_id) return { success: false, message: "Department wajib dipilih." };
    if (!header.company_id) return { success: false, message: "Company wajib terisi." };
    if (!header.requester_esign_id && !header.requester_esign) return { success: false, message: "E-sign requester wajib dipilih/dibuat." };
    if (!payload.attachments || !payload.attachments.length) return { success: false, message: "Lampiran PDF pengajuan wajib diupload." };
    if (!details.length) return { success: false, message: "Minimal 1 detail barang/jasa wajib diisi." };

    for (let i = 0; i < details.length; i++) {
      if (!details[i].item_name) return { success: false, message: "Nama barang/jasa baris " + (i + 1) + " wajib diisi." };
      if (this.toNumber_(details[i].qty) <= 0) return { success: false, message: "Qty baris " + (i + 1) + " harus lebih dari 0." };
      if (!details[i].uom) return { success: false, message: "UOM baris " + (i + 1) + " wajib diisi." };
    }

    const requester = Repository.findOne(CONFIG.SHEET.EMPLOYEE, "employee_id", header.requester_id) || {};
    const fpbId = this.nextId_(CONFIG.SHEET.FPB_HEADER, "fpb_id", "FPB", 10);
    const fpbNo = String(header.fpb_no || "").trim() || this.generateFpbNo_(header.department_id, header.company_id, header.fpb_date || new Date());
    const now = new Date();

    if (Repository.findOne(CONFIG.SHEET.FPB_HEADER, "fpb_no", fpbNo)) {
      return { success: false, message: "Nomor FPB sudah digunakan: " + fpbNo };
    }

    Repository.insert(CONFIG.SHEET.FPB_HEADER, this.cleanByHeaders_({
      fpb_id: fpbId,
      fpb_no: fpbNo,
      fpb_date: header.fpb_date || now,
      request_date: header.fpb_date || now,
      requester_id: header.requester_id,
      requester_name: requester.full_name || requester.nama_lengkap || requester.nama || requester.name || header.requester_name || "",
      department_id: header.department_id,
      department_code: this.getDepartmentCode_(header.department_id),
      company_id: header.company_id,
      cost_center_id: "",
      priority: header.priority || "NORMAL",
      purpose: header.purpose || "",
      description: header.purpose || "",
      requester_esign: header.requester_esign || header.requester_esign_id || "",
      requester_esign_id: header.requester_esign_id || "",
      requester_esign_url: header.requester_esign_url || "",
      requester_esign_at: now,
      requester_leader_approval_status: "PENDING",
      ga_head_check_status: "PENDING",
      status: header.status || "DRAFT",
      current_step: "FPB_DRAFT",
      created_at: now,
      created_by: user.user_id,
      updated_at: now,
      updated_by: user.user_id
    }, Repository.headers(CONFIG.SHEET.FPB_HEADER)));

    const dHeaders = Repository.headers(CONFIG.SHEET.FPB_DETAIL);
    details.forEach(function(d, i) {
      const qty = FPBService.toNumber_(d.qty);
      const price = FPBService.toNumber_(d.estimated_price);
      Repository.insert(CONFIG.SHEET.FPB_DETAIL, FPBService.cleanByHeaders_({
        fpb_detail_id: fpbId + "-D" + String(i + 1).padStart(3, "0"),
        fpb_id: fpbId,
        fpb_no: fpbNo,
        item_name: d.item_name || "",
        item_description: d.item_description || d.specification || "",
        specification: d.item_description || d.specification || "",
        item_category_id: "",
        category_id: "",
        qty: qty,
        uom: d.uom || "",
        estimated_price: price,
        estimated_total: qty * price,
        remarks: d.remarks || "",
        created_at: now,
        created_by: user.user_id,
        updated_at: now,
        updated_by: user.user_id
      }, dHeaders));
    });

    AuditService.log(user, "CREATE_FPB", "FPB", fpbId, "", { fpb_no: fpbNo }, "Create FPB");
    this.saveFPBAttachments_(payload.attachments || [], { fpb_id: fpbId, fpb_no: fpbNo }, user);
    this.createInitialApprovalRows_({
      fpb_id: fpbId,
      fpb_no: fpbNo,
      requester_id: header.requester_id,
      requester_esign: header.requester_esign || "",
      requester_esign_id: header.requester_esign_id || "",
      requester_esign_url: header.requester_esign_url || "",
      status: header.status || "DRAFT"
    }, user);
    this.syncMonitoringAfterCreate_({
      fpb_id: fpbId,
      fpb_no: fpbNo,
      status: header.status || "DRAFT",
      requester_id: header.requester_id,
      department_id: header.department_id,
      priority: header.priority || "NORMAL"
    }, user);
    return { success: true, message: "FPB berhasil dibuat.", data: { fpb_id: fpbId, fpb_no: fpbNo, detail_count: details.length } };
  }


  static saveFPBAttachments_(attachments, doc, user) {
    try {
      if (!attachments || !attachments.length) return;

      const sheetName = CONFIG.SHEET.DOCUMENT_ATTACHMENT || "78_T_DOCUMENT_ATTACHMENT";
      if (!Repository.exists(sheetName)) return;

      const headers = Repository.headers(sheetName);
      const now = new Date();

      attachments.forEach(function(file, idx) {
        if (!file || !file.data_url) return;
        const mime = file.mime_type || file.file_type || "";
        if (String(mime).indexOf("pdf") === -1) return;

        const base64 = String(file.data_url).split(",").pop();
        const bytes = Utilities.base64Decode(base64);
        const blob = Utilities.newBlob(bytes, mime || "application/pdf", file.file_name || ("lampiran_fpb_" + doc.fpb_no + ".pdf"));
        const driveFile = DriveApp.createFile(blob);

        Repository.insert(sheetName, FPBService.cleanByHeaders_({
          attachment_id: "ATT-" + doc.fpb_id + "-" + String(idx + 1).padStart(3, "0"),
          document_type: "FPB",
          document_id: doc.fpb_id,
          document_no: doc.fpb_no,
          file_name: file.file_name || driveFile.getName(),
          file_type: mime || "application/pdf",
          file_url: driveFile.getUrl(),
          file_size: file.file_size || bytes.length,
          attachment_category: "FPB_PENGAJUAN",
          uploaded_by: user.user_id,
          uploaded_at: now,
          is_active: 1
        }, headers));
      });
    } catch (err) {
      Logger.log("saveFPBAttachments_ error: " + (err.message || err));
      throw new Error("Gagal upload lampiran PDF: " + (err.message || err));
    }
  }

  static createInitialApprovalRows_(doc, user) {
    try {
      const sheetName = CONFIG.SHEET.APPROVAL || "80_T_APPROVAL";
      if (!Repository.exists(sheetName)) return;

      const headers = Repository.headers(sheetName);
      const now = new Date();

      const rows = [
        {
          approval_id: "APR-" + doc.fpb_id + "-REQ-ESIGN",
          document_type: "FPB",
          document_id: doc.fpb_id,
          step_code: "REQUESTER_ESIGN",
          approval_level: 0,
          approver_role: "REQUESTER",
          approver_user_id: doc.requester_id || "",
          approval_status: "SIGNED",
          approval_date: now,
          remarks: "E-sign requester: " + (doc.requester_esign_id || doc.requester_esign || "") + (doc.requester_esign_url ? " | " + doc.requester_esign_url : ""),
          created_at: now,
          updated_at: now
        },
        {
          approval_id: "APR-" + doc.fpb_id + "-REQ-LEADER",
          document_type: "FPB",
          document_id: doc.fpb_id,
          step_code: "REQUESTER_LEADER_APPROVAL",
          approval_level: 1,
          approver_role: "REQUESTER_LEADER",
          approver_user_id: "",
          approval_status: "PENDING",
          approval_date: "",
          remarks: "Menunggu e-sign pimpinan requester",
          created_at: now,
          updated_at: now
        },
        {
          approval_id: "APR-" + doc.fpb_id + "-GA-HEAD",
          document_type: "FPB",
          document_id: doc.fpb_id,
          step_code: "GA_HEAD_ESIGN_CHECK",
          approval_level: 2,
          approver_role: "GA_HEAD",
          approver_user_id: "",
          approval_status: "PENDING",
          approval_date: "",
          remarks: "Menunggu pemeriksaan/e-sign pimpinan General Affair",
          created_at: now,
          updated_at: now
        }
      ];

      rows.forEach(function(r) {
        Repository.insert(sheetName, FPBService.cleanByHeaders_(r, headers));
      });
    } catch (err) {
      Logger.log("createInitialApprovalRows_ error: " + (err.message || err));
    }
  }


  static syncMonitoringAfterCreate_(fpbData, user) {
    try {
      const now = new Date();
      const fpbId = fpbData.fpb_id || "";
      const fpbNo = fpbData.fpb_no || fpbId;
      const status = fpbData.status || "DRAFT";
      const priority = fpbData.priority || "NORMAL";
      const requesterId = fpbData.requester_id || "";
      const departmentId = fpbData.department_id || "";
      const stepCode = status === "SUBMITTED" ? "FPB_SUBMITTED" : "FPB_DRAFT";

      const sla = this.findSLAConfig_("FPB", stepCode, priority);
      const slaHour = this.toNumber_(sla.sla_work_hour || 0);
      const warningBefore = this.toNumber_(sla.warning_before_work_hour || 0);

      const dueTime = slaHour > 0 ? new Date(now.getTime() + (slaHour * 60 * 60 * 1000)) : "";
      const warningTime = dueTime && warningBefore > 0 ? new Date(dueTime.getTime() - (warningBefore * 60 * 60 * 1000)) : "";

      const documentPayload = {
        status_id: "DS-" + fpbId,
        document_type: "FPB",
        document_id: fpbId,
        document_no: fpbNo,
        current_step_code: stepCode,
        current_step_name: sla.step_name || (stepCode === "FPB_SUBMITTED" ? "FPB Submitted" : "FPB Draft"),
        current_module: "FPB",
        current_pic_role: sla.pic_role || (stepCode === "FPB_SUBMITTED" ? "GAV" : "REQ"),
        current_pic_user_id: "",
        requester_id: requesterId,
        department_id: departmentId,
        start_date: now,
        last_update: now,
        warning_time: warningTime,
        due_time: dueTime,
        age_work_hour: 0,
        age_calendar_hour: 0,
        sla_work_hour: slaHour,
        remaining_work_hour: slaHour,
        overdue_work_hour: 0,
        overdue_calendar_hour: 0,
        sla_status: "ON_TRACK",
        document_status: status,
        priority_code: priority,
        created_at: now,
        updated_at: now,

        // fallback untuk header lama jika ada
        current_step: stepCode,
        status: status,
        created_by: user.user_id,
        updated_by: user.user_id
      };

      if (CONFIG.SHEET.DOCUMENT_STATUS && Repository.exists(CONFIG.SHEET.DOCUMENT_STATUS)) {
        const existing = Repository.findOne(CONFIG.SHEET.DOCUMENT_STATUS, "document_id", fpbId);
        if (!existing) {
          Repository.insert(CONFIG.SHEET.DOCUMENT_STATUS, this.cleanByHeaders_(documentPayload, Repository.headers(CONFIG.SHEET.DOCUMENT_STATUS)));
        }
      }

      if (CONFIG.SHEET.SLA_SNAPSHOT && Repository.exists(CONFIG.SHEET.SLA_SNAPSHOT)) {
        const existingSLA = Repository.findOne(CONFIG.SHEET.SLA_SNAPSHOT, "document_id", fpbId);
        if (!existingSLA) {
          Repository.insert(CONFIG.SHEET.SLA_SNAPSHOT, this.cleanByHeaders_({
            snapshot_id: "SLA-" + fpbId + "-" + stepCode,
            document_type: "FPB",
            document_id: fpbId,
            document_no: fpbNo,
            step_code: stepCode,
            step_name: sla.step_name || (stepCode === "FPB_SUBMITTED" ? "FPB Submitted" : "FPB Draft"),
            module_name: "FPB",
            pic_role: sla.pic_role || (stepCode === "FPB_SUBMITTED" ? "GAV" : "REQ"),
            pic_user_id: "",
            requester_id: requesterId,
            department_id: departmentId,
            start_time: now,
            warning_time: warningTime,
            due_time: dueTime,
            last_calculate_at: now,
            age_work_hour: 0,
            age_calendar_hour: 0,
            sla_work_hour: slaHour,
            remaining_work_hour: slaHour,
            overdue_work_hour: 0,
            overdue_calendar_hour: 0,
            sla_status: "ON_TRACK",
            document_status: status,
            priority_code: priority
          }, Repository.headers(CONFIG.SHEET.SLA_SNAPSHOT)));
        }
      }

      if (Repository.exists("95_R_DASHBOARD")) {
        const existingReport = Repository.findOne("95_R_DASHBOARD", "document_id", fpbId);
        if (!existingReport) {
          Repository.insert("95_R_DASHBOARD", this.cleanByHeaders_({
            report_id: "RDB-" + fpbId,
            document_id: fpbId,
            document_no: fpbNo,
            document_type: "FPB",
            current_step: stepCode,
            current_step_code: stepCode,
            status: status,
            document_status: status,
            sla_status: "ON_TRACK",
            created_at: now,
            updated_at: now
          }, Repository.headers("95_R_DASHBOARD")));
        }
      }
    } catch (err) {
      Logger.log("syncMonitoringAfterCreate_ error: " + (err.message || err));
    }
  }

  static findSLAConfig_(documentType, stepCode, priority) {
    priority = String(priority || "NORMAL").toUpperCase();
    const rows = Repository.exists(CONFIG.SHEET.SLA) ? Repository.safeGetAll(CONFIG.SHEET.SLA) : [];
    let row = rows.find(function(r) {
      return String(r.document_type || "").toUpperCase() === String(documentType || "").toUpperCase()
        && String(r.step_code || "").toUpperCase() === String(stepCode || "").toUpperCase()
        && String(r.priority_code || "").toUpperCase() === priority
        && (String(r.is_active || "1") === "1" || String(r.is_active || "").toUpperCase() === "TRUE");
    });

    if (!row) {
      row = rows.find(function(r) {
        return String(r.document_type || "").toUpperCase() === String(documentType || "").toUpperCase()
          && String(r.step_code || "").toUpperCase() === String(stepCode || "").toUpperCase()
          && (String(r.is_active || "1") === "1" || String(r.is_active || "").toUpperCase() === "TRUE");
      });
    }

    return row || {
      step_code: stepCode,
      step_name: stepCode,
      module_name: "FPB",
      pic_role: stepCode === "FPB_SUBMITTED" ? "GAV" : "REQ",
      priority_code: priority,
      sla_work_hour: 8,
      warning_before_work_hour: 4
    };
  }

  static rebuildSLAForExistingFPB_() {
    const fpbs = Repository.safeGetAll(CONFIG.SHEET.FPB_HEADER);
    let count = 0;
    fpbs.forEach(function(f) {
      FPBService.syncMonitoringAfterCreate_({
        fpb_id: f.fpb_id || "",
        fpb_no: f.fpb_no || "",
        status: f.status || "DRAFT",
        requester_id: f.requester_id || "",
        department_id: f.department_id || "",
        priority: f.priority || "NORMAL"
      }, { user_id: "SYSTEM" });
      count++;
    });
    return { success: true, message: "Rebuild SLA snapshot selesai.", total: count };
  }



  static getEmployees_() {
    const deptRows = Repository.safeGetAll(CONFIG.SHEET.DEPARTMENT);
    const compRows = Repository.exists(CONFIG.SHEET.COMPANY) ? Repository.safeGetAll(CONFIG.SHEET.COMPANY) : [];
    const deptMap = {};
    deptRows.forEach(function(d) {
      const id = d.department_id || d.dept_id || "";
      if (!id) return;
      deptMap[id] = {
        code: d.department_code || d.dept_code || d.code || id,
        name: d.department_name || d.name || d.department || id,
        company_id: d.company_id || ""
      };
    });
    const compMap = {};
    compRows.forEach(function(c) {
      const id = c.company_id || "";
      if (id) compMap[id] = {
        company_code: c.company_code || c.company_kode || c.kode_company || id,
        company_name: c.company_name || c.name || id
      };
    });

    return Repository.safeGetAll(CONFIG.SHEET.EMPLOYEE).filter(function(r) {
      const a = String(r.is_active !== undefined ? r.is_active : r.aktif || "").toUpperCase();
      return a === "" || a === "1" || a === "TRUE" || a === "AKTIF" || a === "ACTIVE";
    }).map(function(r) {
      const deptId = r.department_id || r.dept_id || r.department || "";
      const dept = deptMap[deptId] || {};
      const companyId = r.company_id || dept.company_id || "";
      return {
        employee_id: r.employee_id || "",
        nik: r.nik || "",
        full_name: r.full_name || r.nama_lengkap || r.nama || r.name || "",
        department_id: deptId,
        department_code: dept.code || deptId,
        department_name: dept.name || deptId,
        company_id: companyId,
        company_code: (compMap[companyId] && compMap[companyId].company_code) || companyId,
        company_name: (compMap[companyId] && compMap[companyId].company_name) || companyId,
        email: r.email || ""
      };
    });
  }

  static getDepartmentCode_(departmentId) {
    const d = Repository.findOne(CONFIG.SHEET.DEPARTMENT, "department_id", departmentId) || {};
    return d.department_code || d.dept_code || d.code || departmentId || "DEPT";
  }

  static generateFpbNo_(departmentId, companyId, dateValue) {
    const d = dateValue ? new Date(dateValue) : new Date();
    const year = d.getFullYear();
    const roman = this.toRoman_(d.getMonth() + 1);
    const deptCode = this.getDepartmentCode_(departmentId);
    const comp = companyId || "COMP";
    const suffix = "/" + deptCode + "/" + comp + "/" + roman + "/" + year;
    let max = 0;
    Repository.safeGetAll(CONFIG.SHEET.FPB_HEADER).forEach(function(r) {
      const no = String(r.fpb_no || "");
      if (no.endsWith(suffix)) {
        const n = Number(no.split("/")[0]);
        if (!isNaN(n) && n > max) max = n;
      }
    });
    return String(max + 1).padStart(3, "0") + suffix;
  }

  static toRoman_(m) {
    return ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][Number(m)] || "";
  }


  static getUOMOptions_() {
    try {
      this.ensureUOMMaster_();
      const sheetName = CONFIG.SHEET.UOM || "23_M_UOM";
      return Repository.safeGetAll(sheetName).filter(function(r) {
        const a = String(r.is_active !== undefined ? r.is_active : "1").toUpperCase();
        return a === "1" || a === "TRUE" || a === "AKTIF" || a === "ACTIVE" || a === "";
      }).map(function(r) {
        return {
          id: r.uom_code || r.uom_id || r.id || "",
          name: r.uom_name || r.name || r.uom_code || r.uom_id || ""
        };
      }).filter(function(x) { return x.id; });
    } catch (err) {
      return [
        { id: "PCS", name: "Pieces" },
        { id: "UNIT", name: "Unit" },
        { id: "SET", name: "Set" },
        { id: "BOX", name: "Box" },
        { id: "PACK", name: "Pack" },
        { id: "METER", name: "Meter" },
        { id: "LS", name: "Lump Sum" }
      ];
    }
  }

  static ensureUOMMaster_() {
    const sheetName = CONFIG.SHEET.UOM || "23_M_UOM";
    const ss = SpreadsheetApp.openById(CONFIG.APP.SPREADSHEET_ID);
    let sh = ss.getSheetByName(sheetName);

    if (!sh) {
      sh = ss.insertSheet(sheetName);
      sh.getRange(1, 1, 1, 5).setValues([["uom_id", "uom_code", "uom_name", "is_active", "created_at"]]);
      const now = new Date();
      const rows = [
        ["UOM001", "PCS", "Pieces", 1, now],
        ["UOM002", "UNIT", "Unit", 1, now],
        ["UOM003", "SET", "Set", 1, now],
        ["UOM004", "BOX", "Box", 1, now],
        ["UOM005", "PACK", "Pack", 1, now],
        ["UOM006", "METER", "Meter", 1, now],
        ["UOM007", "ROLL", "Roll", 1, now],
        ["UOM008", "KG", "Kilogram", 1, now],
        ["UOM009", "LITER", "Liter", 1, now],
        ["UOM010", "LS", "Lump Sum", 1, now]
      ];
      sh.getRange(2, 1, rows.length, 5).setValues(rows);
      sh.setFrozenRows(1);
    }
  }

  static setupUOMMasterV86_() {
    this.ensureUOMMaster_();
    return { success: true, message: "Master UOM siap digunakan.", sheet_name: CONFIG.SHEET.UOM || "23_M_UOM", data: this.getUOMOptions_() };
  }


  static getSimple_(sheetName, idField, nameFields) {
    if (!Repository.exists(sheetName)) return [];
    return Repository.safeGetAll(sheetName).map(function(r) {
      let name = "";
      (nameFields || []).forEach(f => { if (!name && r[f]) name = r[f]; });
      return { id: r[idField] || "", name: name || r[idField] || "" };
    }).filter(x => x.id);
  }

  static nextId_(sheetName, key, prefix, pad) {
    let max = 0;
    Repository.safeGetAll(sheetName).forEach(function(r) {
      const n = Number(String(r[key] || "").replace(prefix, ""));
      if (!isNaN(n)) max = Math.max(max, n);
    });
    return prefix + String(max + 1).padStart(pad || 6, "0");
  }

  static cleanByHeaders_(data, headers) {
    const out = {};
    headers.forEach(h => { if (data[h] !== undefined) out[h] = data[h]; });
    return out;
  }

  static toNumber_(value) {
    const n = Number(String(value || "0").replace(/\./g, "").replace(",", "."));
    return isNaN(n) ? 0 : n;
  }
}


/*************************************************
 * FPB GLOBAL API FALLBACK - V7.6
 * Dipakai jika ApiController lama belum menangkap action.
 *************************************************/
function getFPBInit(payload) {
  return FPBService.getInitData(payload || {}, { user_id: "SYSTEM" });
}

function listFPB(payload) {
  return FPBService.list(payload || {}, { user_id: "SYSTEM" });
}

function createFPB(payload) {
  return FPBService.create(payload || {}, { user_id: "SYSTEM" });
}

function searchFPBRequester(payload) {
  return FPBService.searchEmployees(payload || {}, { user_id: "SYSTEM" });
}

function previewFPBNo(payload) {
  return FPBService.previewNumber(payload || {}, { user_id: "SYSTEM" });
}
