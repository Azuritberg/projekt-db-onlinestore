import { views } from "./views.js";
import { Session } from "./session.js";

const session = new Session();

async function main() {
  let currentView = "start";
  let data = null;

  while (true) {
    console.clear();
    await views[currentView](
      session,
      (nextView, nextData = null) => {
        currentView = nextView;
        data = nextData;
      },
      data,
    );
  }
}

main();
