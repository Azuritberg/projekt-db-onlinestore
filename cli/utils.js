export async function input() {
  return prompt(">");
}

export function print(text, style = "nav") {
  switch (style) {
    case "nav":
      const str = text.split(" ");
      console.log(
        `%c(${str[0]}) %c${str.slice(1).join(" ")}`,
        "font-weight: bold; color: blue",
        "font-weight: normal",
      );
      break;

    case "h1":
      console.log("%c[" + text + "]", "font-weight: bold; color: green");
      break;

    case "h2":
      console.log("%c" + text, "text-decoration: underline; color: orange");
      break;

    case "info":
      console.log("%c" + text, "font-style: italic");
      break;

    case "error":
      console.log("%c" + text, "color: red");
      break;

    case "interactive":
      console.log("%c" + text, "color: yellow; text-decoration: underline");
      break;

    case "msg":
      console.log("%c" + text, "color: yellow; font-weight: bold");
      break;

    default:
      console.log("%c" + text);
      break;
  }
}
