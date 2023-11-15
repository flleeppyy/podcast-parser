import { Podcast } from "./classes/Podcast.js";
import { writeFile } from "node:fs/promises";

const baseUrl = "https://feeds.megaphone.fm/darknetdiaries";

async function init() {
  const podcast = await Podcast.create(baseUrl);

  // @ts-expect-error sdfdsfsd
  for (const e of podcast.episodes) delete e.podcast;

  const json = JSON.stringify(podcast, null, "  ");

  await writeFile("./output.json", json);
}

await init();
