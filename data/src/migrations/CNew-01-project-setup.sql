CREATE TABLE "inbox" (
  "inboxName" VARCHAR NOT NULL,
  "publicKey" VARCHAR NOT NULL,
  "initialNonce" INT NOT NULL,
  PRIMARY KEY ("inboxName")
);

CREATE TABLE "slot" (
  "inboxName" VARCHAR NOT NULL,
  "nonce" INT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "packet" VARCHAR,
  "publicKey" VARCHAR,
  "consumed" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("inboxName", nonce),
  FOREIGN KEY ("inboxName") REFERENCES "inbox"("inboxName")
);

