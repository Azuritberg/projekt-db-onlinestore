export function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function sendRes(status, data) {
  let statusText;
  switch (status) {
    case 200:
      statusText = "OK";
      break;
    case 400:
      statusText = "Bad Request";
      break;
    case 401:
      statusText = "Unauthorized";
      break;
    case 404:
      statusText = "Not Found";
      break;
    case 409:
      statusText = "Conflict";
      break;
    case 500:
      statusText = "Internal Server Error";
      break;
    default:
      statusText = "Unknown";
  }
  const headers = new Headers({
    "Content-Type": "application/json",
  });
  const opt = { status, statusText, headers };
  try {
    return new Response(JSON.stringify(data), opt);
  } catch (e) {
    console.error(`${e}\n${String(data)}`);
    return new Response(
      JSON.stringify({
        error: "Internal server error, please try again later",
      }),
      { status: 500, statusText: "Internal Server Error,", headers },
    );
  }
}

export async function validateJsonReq(req) {
  if (req.headers.get("Content-Type") !== "application/json") {
    console.warn("Content-type header not application/json");
    return false;
  }

  try {
    const o = await req.json();
    if (o && typeof o === "object") {
      return true;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
}

export function checkKeys(obj, keys) {
  for (const key of keys) {
    if (!obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}
