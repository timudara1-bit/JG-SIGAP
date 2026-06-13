class FpbService {

  static createDraft(payload){

    assertRoleCan("create_fpb");
    const session =
      SessionService.getSession();

    const fpbId =
      Utilities.getUuid();

    const header = {

      fpb_id: fpbId,

      no_fpb: "",

      tanggal_fpb:
        payload.tanggal,

      requestor_id:
        session.user_id,

      dept_code:
        session.dept,

      prioritas:
        payload.prioritas,

      justifikasi:
        payload.justifikasi,

      total_estimasi:
        payload.total,

      status:
        "DRAFT",

      current_step:
        "CREATE_FPB"

    };

    FpbRepository.saveHeader(
      header
    );

    payload.items.forEach(i=>{

      i.fpb_id = fpbId;

    });

    FpbRepository.saveDetail(
      payload.items
    );

    return fpbId;

  }

  static submitFPB(fpbId){

    assertRoleCan("create_fpb");
    const session =
      SessionService.getSession();

    const noFPB =
      NumberingService.generateFPBNumber(
        session.dept
      );

    FpbRepository.submitFPB(
      fpbId,
      noFPB
    );

    WorkflowService.createWorkflow(
      "FPB",
      fpbId
    );

    ApprovalService.createApproval(
      "FPB",
      fpbId,
      "ATASAN_L1",
      1
    );

    return true;

  }

}