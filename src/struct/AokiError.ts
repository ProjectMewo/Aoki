import { ChatInputCommandInteraction, Message } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';

/**
 * Custom error class for standardized error handling.
 */
export default class AokiError extends Error {
  /**
   * The type of error that occurred
   */
  public type: ErrorType;

  /**
   * The class that sent the error
   */
  public sender: ChatInputCommandInteraction | Message;
  
  /**
   * Additional data related to the error
   */
  public data?: Record<string, any>;

  /**
   * Whether the error should be sent ephemerally
   */
  public ephemeral: boolean;

  /**
   * Creates a new Aoki error instance
   * 
   * @param {ChatInputCommandInteraction | Message} options.sender The class that sent the error
   * @param {string} options.content The error message
   * @param {ErrorType} options.type The type of error
   * @param {Record<string, any>} options.data Additional data related to the error
   */
  constructor(options: {
    sender: ChatInputCommandInteraction | Message,
    content: string, 
    type: ErrorType, 
    data?: Record<string, any>
  }) {
    super(options.content);
    this.name = 'AokiError';
    this.sender = options.sender;
    this.type = options.type;
    this.data = options.data;
    this.ephemeral = [
      'permission', 'cooldown', 'generic', 
      'user_input', 'not_found', 'nsfw'
    ].includes(this.type);
  }
  
  /**
   * Handles the error by sending a message to the user and logging to console
   * @returns {Promise<void>}
   */
  public async handle(): Promise<void> {
    try {
      // For ephemeral errors, just send the message without logging
      if (this.ephemeral) {
        if (this.sender instanceof ChatInputCommandInteraction) {
          if (this.sender.replied) {
            await this.sender.editOrReply({
              content: this.message,
              flags: MessageFlags.Ephemeral
            });
          } else {
            await this.sender.write({
              content: this.message,
              flags: MessageFlags.Ephemeral
            });
          }
        } else if (this.sender instanceof Message) {
          await this.sender.reply({ content: this.message });
        }
        return;
      }

      // Log the error to console (only for non-ephemeral errors)
      this.sender.client.logger.error(`${this.type.toUpperCase()}: ${this.message}`);
      
      // Send message to user based on interaction or message type
      if (this.sender instanceof ChatInputCommandInteraction) {
        if (this.sender.replied) {
          await this.sender.editOrReply({
            content: this.message
          });
        } else {
          await this.sender.write({
            content: this.message
          });
        }
      } else if (this.sender instanceof Message) {
        await this.sender.reply({ content: this.message });
      }
    } catch (err) {
      // If handling the error fails, log this secondary error
      this.sender.client.logger.error('Error while handling AokiError: ' + err);
    }
  }

  /**
   * Static methods for each error type to create and handle errors
   */
  public static GENERIC(options: { sender: ChatInputCommandInteraction | Message; content: string; data?: Record<string, any> }): never | void {
    const error = new AokiError({ ...options, type: ErrorType.GENERIC });
    void error.handle();
    if (!error.ephemeral) throw error;
  }

  public static PERMISSION(options: { sender: ChatInputCommandInteraction | Message; content: string; data?: Record<string, any> }): never | void {
    const error = new AokiError({ ...options, type: ErrorType.PERMISSION });
    void error.handle();
    if (!error.ephemeral) throw error;
  }

  public static USER_INPUT(options: { sender: ChatInputCommandInteraction | Message; content: string; data?: Record<string, any> }): never | void {
    const error = new AokiError({ ...options, type: ErrorType.USER_INPUT });
    void error.handle();
    if (!error.ephemeral) throw error;
  }

  public static API_ERROR(options: { sender: ChatInputCommandInteraction | Message; content: string; data?: Record<string, any> }): never | void {
    const error = new AokiError({ ...options, type: ErrorType.API_ERROR });
    void error.handle();
    if (!error.ephemeral) throw error;
  }

  public static DATABASE(options: { sender: ChatInputCommandInteraction | Message; content: string; data?: Record<string, any> }): never | void {
    const error = new AokiError({ ...options, type: ErrorType.DATABASE });
    void error.handle();
    if (!error.ephemeral) throw error;
  }

  public static NOT_FOUND(options: { sender: ChatInputCommandInteraction | Message; content: string; data?: Record<string, any> }): never | void {
    const error = new AokiError({ ...options, type: ErrorType.NOT_FOUND });
    void error.handle();
    if (!error.ephemeral) throw error;
  }

  public static NSFW(options: { sender: ChatInputCommandInteraction | Message; content: string; data?: Record<string, any> }): never | void {
    const error = new AokiError({ ...options, type: ErrorType.NSFW });
    void error.handle();
    if (!error.ephemeral) throw error;
  }

  public static COOLDOWN(options: { sender: ChatInputCommandInteraction | Message; content: string; data?: Record<string, any> }): never | void {
    const error = new AokiError({ ...options, type: ErrorType.COOLDOWN });
    void error.handle();
    if (!error.ephemeral) throw error;
  }

  public static INTERNAL(options: { sender: ChatInputCommandInteraction | Message; content: string; data?: Record<string, any> }): never | void {
    const error = new AokiError({ ...options, type: ErrorType.INTERNAL });
    void error.handle();
    if (!error.ephemeral) throw error;
  }
}

/**
 * Types of errors that can occur in the application
 */
export enum ErrorType {
  GENERIC = 'generic',
  PERMISSION = 'permission',
  USER_INPUT = 'user_input',
  API_ERROR = 'api_error',
  DATABASE = 'database',
  NOT_FOUND = 'not_found',
  NSFW = 'nsfw',
  COOLDOWN = 'cooldown',
  INTERNAL = 'internal',
  SELF_CONTRUCTED = 'self_constructed'
}