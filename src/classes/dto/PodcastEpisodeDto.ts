import { PodcastEpisode } from "../PodcastEpisode.js";
import { PodcastPartialDto } from "./PodcastPartialDto.js";

export class PodcastEpisodeDto {
  constructor(
    public episode: number,
    public season: number,
    public title: string,
    public subtitle: string,
    public description: string,
    public podcast: PodcastPartialDto,
    public duration?: number,
    public mp3Url?: string,
    public headerImageUrl?: string,
  ) {
  }

  public static from({ episode, season, title, subtitle, description, podcast, duration, mp3Url, headerImageUrl }: PodcastEpisode): PodcastEpisodeDto {
    return new PodcastEpisodeDto(episode, season, title, subtitle, description, PodcastPartialDto.from(podcast), duration, mp3Url, headerImageUrl);
  }
}