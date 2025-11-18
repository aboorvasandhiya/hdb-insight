import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
const dbName = "hdb_insights";

const towns = [
  "Ang Mo Kio", "Bedok", "Bishan", "Bukit Batok", "Bukit Merah",
  "Bukit Panjang", "Bukit Timah", "Central Area", "Clementi",
  "Geylang", "Hougang", "Jurong East", "Jurong West", "Kallang",
  "Marine Parade", "Pasir Ris", "Punggol", "Queenstown", "Sembawang",
  "Sengkang", "Serangoon", "Tampines", "Toa Payoh", "Woodlands", "Yishun"
];

const sampleComments = [
  "very quiet at night, good for light sleepers",
  "MRT is a short walk but fully sheltered",
  "noticeable road noise during rush hour",
  "great place for young families with kids",
  "lots of coffee shops and minimarts nearby",
  "area feels packed during weekends",
  "huge central park that residents use daily",
  "under ten minutes to get daily groceries",
  "would definitely choose to live here again",
  "estate feels like it will appreciate in value",

  "blocks are freshly painted and look modern",
  "void decks are clean and well lit",
  "neighbours are generally polite and respectful",
  "residents are active in community events",
  "sports facilities are within walking distance",
  "wet market has a good range of fresh produce",
  "many late-night supper spots within the estate",
  "lots of shaded walkways connecting the blocks",
  "easy access to town by direct bus routes",
  "cycling paths link nicely to nearby parks",

  "playgrounds are new and very well designed",
  "primary and secondary schools are close by",
  "childcare centres are easy to find around here",
  "estate feels safe even when walking home late",
  "police and security presence is quite visible",
  "lifts are spacious and usually in good condition",
  "multi-storey carpark has plenty of lots on weekdays",
  "town centre is lively without feeling chaotic",
  "rental prices in this area are still reasonable",
  "good mix of young and older residents",

  "some blocks are starting to show their age",
  "hallways can feel narrow during moving days",
  "food choices are repetitive if you stay long-term",
  "dust from nearby construction can be an issue",
  "rain causes minor ponding near certain walkways",
  "morning school traffic makes the junction busy",
  "market crowds make weekends a bit stressful",
  "street lighting could be brighter in a few spots",
  "can hear planes passing overhead occasionally",
  "queue for lifts is long during peak hours",

  "overall a comfortable estate for long-term stay",
  "nice balance between greenery and urban facilities",
  "good compromise between price and convenience",
  "location makes commuting to work manageable",
  "estate has a calm atmosphere after dinner time",
  "pet-friendly neighbourhood with many dog owners",
  "festive decorations make the area feel welcoming",
  "plenty of benches and resting spots for seniors",
  "recycling points are conveniently located",
  "neighbourhood feels more relaxed than the city centre"
];


function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {
  await client.connect();
  const db = client.db(dbName);
  const Insights = db.collection("insights");
  const Users = db.collection("users");

  // pick a random existing user
  const users = await Users.find().toArray();
  if (users.length === 0) {
    console.log("❌ No real users exist. Create at least 1 user first.");
    return;
  }

  const bulk = [];

  for (let i = 0; i < 80; i++) {
    const u = randomItem(users);
    const town = randomItem(towns);
    const rating = Math.floor(Math.random() * 5) + 1;

    bulk.push({
      insertOne: {
        document: {
          userId: u._id,
          username: u.username,
          town,
          comment: randomItem(sampleComments),
          rating,
          tags: [],
          status: "approved",
          date: new Date(Date.now() - Math.random() * 10 * 86400000),
          createdAt: new Date(),
          updatedAt: null
        }
      }
    });
  }

  await Insights.bulkWrite(bulk);
  console.log("✅ Inserted 80 fake insights.");
  await client.close();
}

run();
