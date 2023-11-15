import { Podcast } from "../Podcast.js";
import { PodcastEpisodeDto } from "./PodcastEpisodeDto.js";
import { PodcastPartialDto } from "./PodcastPartialDto.js";

export class PodcastDto extends PodcastPartialDto {
  constructor(
    title: string,
    author: string,
    public readonly description: string,
    public readonly subtitle: string,
    public readonly categories: string[],
    public readonly link: string,
    public readonly language: string,
    public readonly explicit: boolean,
    public readonly episodes: PodcastEpisodeDto[],
    public readonly feedUrl: string,
    public readonly imageUrl: string,
  ) {
    super(title, author);
  }

  public static from({ title, author, description, subtitle, categories, link, language, explicit, episodes, feedUrl, imageUrl }: Podcast): PodcastDto {
    return new PodcastDto(title, author, description, subtitle, categories, link, language, explicit, episodes.map(PodcastEpisodeDto.from), feedUrl, imageUrl);
  }
}