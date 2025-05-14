import { Message } from "discord.js";
import AokiClient from "../Client";

/**
 * Utility class for logging and error handling
 */
export default class LogUtil {
  public logChannel: string;

  constructor() {
    this.logChannel = "864096602952433665";
  }

  /**
   * Process an exception event (unhandledRejection or uncaughtException)
   * @param {string} event The event name
   * @param {Array} args Array with the error as the first element
   * @param {AokiClient} client The client, used to get the channel and warn if needed
   * @returns {void}
   */
  public processException(event: string, args: Array<any>, client: AokiClient): Promise<Message> | void {
    const channel = client.channels.cache.get("864096602952433665");
    const error = args[0];
  
    console.log(error);
    const stack = error.stack
      ?.split("\n")
      .slice(0, 5)
      .join("\n")
      .split(process.cwd())
      .join("MAIN_PROCESS") || "";
  
    const message = `\\🛠 ${error.name} caught!\n\`\`\`xl\n${stack}\n.....\n\`\`\``;
  
    if (channel && 'send' in channel) return channel.send(message);
    else return this.warn(`Channel not found for event '${event}'`, "[PROCESS]");
  }

  /**
   * Logs an errornous action to console.
   * @param {String} message The message to log
   * @param {String} title The title of the error message
   * @returns {void}
   */
  public error(message: string, title: string = "Error"): void {
    return console.log("\x1b[31m", title, "\x1b[0m", message);
  }

  /**
   * Logs a successful action to console.
   * @param {String} message The message to log
   * @param {String} title The title of the success message
   * @returns {void}
   */
  public success(message: string, title: string = "Success"): void {
    return console.log("\x1b[32m", title, "\x1b[0m", message);
  }

  /**
   * Logs a warning to console.
   * @param {String} message The message to log
   * @param {String} title The title of the warning message
   * @returns {void}
   */
  public warn(message: string, title: string = "Warn"): void {
    return console.log("\x1b[33m", title, "\x1b[0m", message);
  }
}