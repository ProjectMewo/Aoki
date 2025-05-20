import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createStringOption, 
  Declare, 
  SubCommand, 
  Options, 
  Locales
} from "seyfert";

const options = {
  query: createStringOption({
    description: 'the text to convert to OwO speak',
    required: true,
    description_localizations: {
      "en-US": 'the text to convert to OwO speak',
      "vi": 'văn bản để chuyển đổi sang ngôn ngữ OwO'
    }
  })
}

@Declare({
  name: 'owo',
  description: 'convert your text to OwO speak.'
})
@Locales({
  name: [
    ['en-US', 'owo'],
    ['vi', 'owo']
  ],
  description: [
    ['en-US', 'convert your text to OwO speak.'],
    ['vi', 'chuyển văn bản của cậu sang ngôn ngữ OwO.']
  ]
})
@Options(options)
export default class Owo extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).fun.owo;
    // get the text from the options
    const text = ctx.options.query;

    // fetch from the nekos.life API to convert text to owo
    const res = await fetch(`https://nekos.life/api/v2/owoify?text=${encodeURIComponent(text)}`).then(res => res.json());

    // check if the API returned a valid response
    if (!res || !res.owo) {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.apiError
      });
    }

    // send the response
    await ctx.write({ content: res.owo });
  }
}