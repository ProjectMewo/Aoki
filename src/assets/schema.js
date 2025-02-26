/**
 * Initializes the database schema
 * @param {*} sql 
 */
export default async (sql) => {
  await sql`CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY NOT NULL,
    ingamename TEXT,
    defaultmode TEXT,
    processmessagepermission BOOLEAN
  )`;
  await sql`CREATE TABLE IF NOT EXISTS schedules (
    id BIGINT PRIMARY KEY NOT NULL,
    anilistid INTEGER NOT NULL,
    nextep INTEGER NOT NULL
  )`;
  await sql`CREATE TABLE IF NOT EXISTS guilds (
    id BIGINT PRIMARY KEY,
    timestampchannel BIGINT,
    verificationstatus BOOLEAN,
    verificationroleid TEXT,
    verificationchannelid BIGINT,
    verificationmessageid BIGINT,
    verificationtitle TEXT,
    verificationdescription TEXT,
    verificationthumbnail TEXT,
    verificationcolor TEXT
  )`;
  await sql`CREATE TABLE IF NOT EXISTS verifications (
    id BIGINT PRIMARY KEY,
    state TEXT NOT NULL,
    createdat TEXT NOT NULL,
    guildId BIGINT NOT NULL
  )`;
}