import amqp, { Connection, Options } from 'amqplib'
import { RabbitConfig } from '@ioc:Adonis/Addons/Rabbit'

export default class RabbitConnection {
  /**
   * Whether the connection has already been established
   */
  public hasConnection: boolean = false

  /**
   * The connection
   */
  private $connection?: Connection
  private $connectionPromise?: Promise<Connection>

  /**
   * The credentials
   */
  private readonly $connectionUrl: string

  private readonly $options: Options.Connect

  constructor(private readonly rabbitConfig: RabbitConfig) {
    this.$connectionUrl = this.rabbitConfig.url
    this.$options = this.rabbitConfig.options || {}
  }

  /**
   * Returns the connection URL
   */
  public get url() {
    return this.$connectionUrl
  }

  /**
   * Returns the connection options
   */
  public get options() {
    return this.$options
  }

  /**
   * Returns the connection
   */
  public async getConnection(): Promise<Connection> {
    if (!this.$connection) {
      if (!this.$connectionPromise) {
        this.$connectionPromise = amqp.connect(this.url, this.options).catch((error) => {
          this.$connectionPromise = undefined // Reset promise to allow retries
          throw error
        })
      }
      this.$connection = await this.$connectionPromise
      this.hasConnection = true
    }
    return this.$connection
  }

  /**
   * Closes the connection
   */
  public async closeConnection(): Promise<void> {
    if (this.hasConnection && this.$connection) {
      await this.$connection.close()
      this.$connection = undefined
      this.$connectionPromise = undefined
      this.hasConnection = false
    }
  }
}
