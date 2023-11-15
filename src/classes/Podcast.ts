import { PodcastEpisode } from "./Episode.js";
import * as cheerio from "cheerio";

export class Podcast {
  // Basic info
  title!: string;
  description!: string;
  subtitle!: string;
  author!: string;
  categories!: string[];

  // Other stuff
  link!: string;
  language!: string;
  explicit!: boolean;
  feedUrl!: string;

  episodes!: PodcastEpisode[];
  private _cherrio!: cheerio.CheerioAPI;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor(feedUrl: string) {
    this.feedUrl = feedUrl;
  }

  private async _init() {
    const response = await fetch(this.feedUrl);
    const feedRaw = await response.text();

    this._cherrio = cheerio.load(feedRaw, {
      xml: true,
    });
    // shutup, convenience
    const $ = this._cherrio;

    this.title = $("channel > title").text();
    this.description = $("channel > description").first().text();
    this.subtitle = $("channel > subtitle").first().text();
    this.author = $("channel > itunes\\:author").first().text();
    this.categories = $("channel > itunes\\:category")
      .map((_e, el) => {
        return el.attribs.text;
      })
      .toArray();

    this.explicit = $("channel > itunes\\:explicit").first().text() === "yes";
    this.language = $("channel > language").first().text();
    this.link = $("channel > link").first().text();
    this.episodes = [];

    const episodesArr = $("channel > item").toArray();
    for (const episode of episodesArr) {
      // wow this is ugly
      const _$ = $.load($.html(episode));

      const episodeNum = Number(_$("itunes\\:episode").text());
      const title = _$("itunes\\:title").text();
      const season = Number(_$("itunes\\:season").text());
      const description = _$("description").text();
      const subtitle = _$("itunes\\:subtitle").text();
      const imageUrl = _$("itunes\\:image").attr("href");
      const duration = Number(_$("itunes\\:duration").text());
      const mp3Url = _$("enclosure").attr("url");
      const episodeInst = new PodcastEpisode(
        this,
        episodeNum,
        season,
        title,
        subtitle,
        description,
        imageUrl,
        duration,
        mp3Url,
      );

      this.episodes.push(episodeInst);
    }
  }

  public static async create(feedUrl: string): Promise<Podcast> {
    const podcast = new Podcast(feedUrl);
    await podcast._init();
    // I'd rather not deal with weird object crap and just, do all of the async init inside another function that has access to `this`
    return podcast;
  }

  public async getImage(): Promise<Buffer> {
    const image = this._cherrio("channel > image > url").text();

    const response = await fetch(image);

    const buffer = Buffer.from(await response.arrayBuffer());

    return buffer;
  }

  public getEpisodeCount() {
    return this._cherrio("channel > item").length;
  }
}
