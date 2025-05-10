import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createStringOption, 
  Declare, 
  SubCommand, 
  Options 
} from "seyfert";

const options = {
  query: createStringOption({
    description: 'The text to convert to OwO speak',
    required: true
  })
}

@Declare({
  name: 'owo',
  description: 'Convert your text to OwO speak.'
})
@Options(options)
export default class Owo extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    // get the text from the options
    const text = ctx.options.query;

    // fetch from the nekos.life API to convert text to owo
    const res = await fetch(`https://nekos.life/api/v2/owoify?text=${encodeURIComponent(text)}`).then(res => res.json());

    // check if the API returned a valid response
    if (!res || !res.owo) {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: "Failed to convert text to OwO speak. Please try again later."
      });
    }

    // send the response
    await ctx.write({ content: res.owo });
  }
}