import { Podcast } from "./classes/Podcast.js";
import { writeFile } from "node:fs/promises";
import { PodcastDto } from "./classes/dto/PodcastDto.js";

const baseUrl = "https://feeds.megaphone.fm/darknetdiaries";

async function init() {
  const podcast = await Podcast.create(baseUrl);

  const json = JSON.stringify(PodcastDto.from(podcast), null, 2);

  await writeFile("./output.json", json);
}

await init();
