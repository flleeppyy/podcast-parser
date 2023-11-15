import { Podcast } from "./Podcast.js";
import * as cheerio from "cheerio";

export class PodcastEpisode {
  podcast: Podcast;
  episode: number;
  season: number;
  title: string;
  subtitle: string;
  description: string;
  duration: number | undefined;
  headerImageUrl: string | undefined;

  private _transcriptUrl: string;
  private _mp3Url: string | undefined;

  constructor(
    podcast: Podcast,
    episode: number,
    season: number,
    title: string,
    subtitle: string,
    description: string,
    headerImageUrl: string | undefined,
    duration: number | undefined,
    mp3Url: string | undefined,
  ) {
    this.podcast = podcast;
    this.episode = episode;
    this.season = season;
    this.title = title;
    this.subtitle = subtitle;
    this.description = description;
    this.headerImageUrl = headerImageUrl;
    this.duration = duration;
    this._mp3Url = mp3Url;

    this._transcriptUrl = `https://darknetdiaries.com/transcript/${episode}/`;
  }

  public async getTranscript(): Promise<string> {
    const response = await fetch(this._transcriptUrl);

    const $ = cheerio.load(await response.text());

    const transcript = $("pre").text();

    return transcript;
  }

  public async getHeaderImage(): Promise<Buffer | undefined> {
    if (!this.headerImageUrl) return undefined;
    const response = await fetch(this.headerImageUrl);

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    return imageBuffer;
  }

  public async downloadMp3(): Promise<File | undefined> {
    if (!this._mp3Url) return undefined;
    const response = await fetch(this._mp3Url);
    const mp3Buffer = new File(
      [await response.blob()],
      `${this.podcast.author} - ${this.podcast.title} - ${this.episode}`,
    );
    return mp3Buffer
  }
}
