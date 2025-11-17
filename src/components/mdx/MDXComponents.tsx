import { DiceNotation } from '../dice/DiceNotation'
import { ImageLightbox } from '../lightbox/ImageLightbox'

export const MDXComponents = {
  Dice: DiceNotation,
  DiceNotation, // Make DiceNotation available without import
  ImageLightbox,
  // Add more custom components as needed
}
