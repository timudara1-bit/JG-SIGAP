function validateHeader(
  uploadedHeader,
  templateHeader
){

  const missing =
    templateHeader.filter(
      x => !uploadedHeader.includes(x)
    );

  return {

    valid:
      missing.length === 0,

    missing

  };

}