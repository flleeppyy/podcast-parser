import * as cheerio from "cheerio";
import { PodcastEpisode } from "./PodcastEpisode.js";
import { PodcastPartial } from "./PodcastPartial.js";

export class Podcast extends PodcastPartial {
  private _image?: File;

  constructor(
    // Basic info (inherited from PodcastPartial)
    title: string,
    author: string,

    // Additional info & attributes
    public readonly description: string,
    public readonly subtitle: string,
    public readonly categories: string[],
    public readonly link: string,
    public readonly language: string,
    public readonly explicit: boolean,

    // Episodes
    public readonly episodes: PodcastEpisode[],

    // URLs
    public readonly feedUrl: string,
    public readonly imageUrl: string,
  ) {
    super(title, author);
  }

  public static async create(feedUrl: string): Promise<Podcast> {
    const response = await fetch(feedUrl);
    const feedRaw = await response.text();

    const podcast = await Podcast.parse(feedRaw, feedUrl);

    return podcast;
  }

  private static parse(feedRaw: cheerio.AnyNode | string, feedUrl: string): Podcast {
    const $ = cheerio.load(feedRaw, {
      xml: true,
    });

    const title = $("channel > title").text();
    const description = $("channel > description").first().text();
    const subtitle = $("channel > subtitle").first().text();
    const author = $("channel > itunes\\:author").first().text();
    const categories = $("channel > itunes\\:category")
      .map((_e, el) => {
        return el.attribs.text;
      })
      .toArray();

    const explicit = $("channel > itunes\\:explicit").first().text() === "yes";
    const language = $("channel > language").first().text();
    const link = $("channel > link").first().text();

    const podcastPartial = new PodcastPartial(title, author);
    const episodes = $("channel > item").toArray().map((el) => PodcastEpisode.parse(el, podcastPartial));

    const imageUrl = $("channel > image > url").text();

    return new Podcast(title, author, description, subtitle, categories, link, language, explicit, episodes, feedUrl, imageUrl);
  }

  public async getImage(): Promise<File> {
    if (this._image) {
      return this._image;
    }

    const response = await fetch(this.imageUrl);

    const imageFile = new File(
      [await response.blob()],
      `${this.author} - ${this.title}`,
    );

    return this._image = imageFile;
  }
}
