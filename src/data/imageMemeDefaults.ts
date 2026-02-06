import type { ImageMemeItem } from '../schemas/imageMemeSchema'

/** 默认 2 条看图猜梗题目：开箱可玩 */
export const defaultImageMemeItems: ImageMemeItem[] = [
  {
    id: 'pig-guess',
    image: 'img/guessPic/pigGuess.png',
    answer: '二锅头',
    aliases: ['二锅头酒', 'erguotou']
  },
  {
    id: 'roubao-guess',
    image: 'img/guessPic/roubaoGuess.png',
    answer: '书包',
    aliases: ['书袋', 'shubao']
  }
]
