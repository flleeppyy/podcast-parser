import * as cheerio from "cheerio";
import { PodcastPartial } from "./PodcastPartial.js";

export class PodcastEpisode {
  public transcriptUrl: string;

  // Save the files in memory so if called multiple times they don't need to be re-downloaded.
  private _mp3?: File;
  private _headerImage?: File;
  private _transcript?: string;

  private _fileName: string;

  constructor(
    public episode: number,
    public season: number,
    public title: string,
    public subtitle: string,
    public description: string,
    public podcast: PodcastPartial,
    public duration?: number,
    public mp3Url?: string,
    public headerImageUrl?: string,
  ) {
    this.transcriptUrl = `https://darknetdiaries.com/transcript/${this.episode}/`;
    this._fileName = `${this.podcast.author} - ${this.podcast.title} - ${this.episode}`;
  }

  public static parse(feedRaw: cheerio.AnyNode | string, podcastPartial: PodcastPartial): PodcastEpisode {
    const $ = cheerio.load(feedRaw, {
      xml: true,
    });

    const episodeNum = Number($("itunes\\:episode").text());
    const title = $("itunes\\:title").text();
    const season = Number($("itunes\\:season").text());
    const description = $("description").text();
    const subtitle = $("itunes\\:subtitle").text();
    const imageUrl = $("itunes\\:image").attr("href");
    const duration = Number($("itunes\\:duration").text());
    const mp3Url = $("enclosure").attr("url");

    return new PodcastEpisode(
      episodeNum,
      season,
      title,
      subtitle,
      description,
      podcastPartial,
      duration,
      mp3Url,
      imageUrl,
    );
  }

  public async getTranscript(): Promise<string> {
    if (this._transcript) {
      return this._transcript;
    }

    const response = await fetch(this.transcriptUrl);

    const $ = cheerio.load(await response.text());

    const transcript = $("pre").text();

    return this._transcript = transcript;
  }

  public async getHeaderImage(): Promise<File | undefined> {
    if (this._headerImage) {
      return this._headerImage;
    }

    if (!this.headerImageUrl) {
      return undefined;
    }

    const response = await fetch(this.headerImageUrl);

    const imageFile = new File(
      [await response.blob()],
      this._fileName,
    );

    return this._headerImage = imageFile;
  }

  public async getMp3(): Promise<File | undefined> {
    if (this._mp3) {
      return this._mp3;
    }

    if (!this.mp3Url) {
      return undefined;
    }

    const response = await fetch(this.mp3Url);

    const mp3File = new File(
      [await response.blob()],
      this._fileName,
    );

    return this._mp3 = mp3File;
  }

}
