import { PodcastPartial } from "../PodcastPartial.js";

export class PodcastPartialDto {
  constructor(
    public title: string,
    public author: string,
  ) { }

  public static from({ title, author }: PodcastPartial) {
    return new PodcastPartial(title, author);
  }
}