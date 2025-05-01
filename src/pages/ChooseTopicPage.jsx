import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// ===== 단어 리스트 =====
const backgrounds = [
  "Sky", "Ocean", "Space", "Jungle", "Desert", "Forest", "Castle", "City", "Volcano", "River",
  "Galaxy", "Cave", "Beach", "Village", "Mountain", "Island", "Garden", "Snowfield", "Lake", "Stadium",
  "Moon", "Mars", "Sun", "Waterfall", "Iceberg", "Road", "Bridge", "Field", "Meadow", "Spaceport",
  "Subway", "Library", "School", "Tower", "Lighthouse", "Battlefield", "Swamp", "Temple", "Farm",
  "Market", "Factory", "AmusementPark", "Zoo", "Aquarium", "Museum", "Theater", "Playground", "Port",
  "Rainforest", "Ruins", "VillageSquare", "Fountain", "Airport", "Seabed", "Park", "Cemetery",
  "PirateShip", "Skyscraper", "Tunnel", "Glacier", "Oasis", "Underground", "Plaza", "BusStop",
  "Railway", "Planet", "Blackhole", "Windmill", "HotSpring", "Observatory", "Graveyard", "TrainStation"
];

const actions = [
  "Flying", "Running", "Swimming", "Dancing", "Singing", "Jumping", "Sleeping", "Riding",
  "Surfing", "Climbing", "Falling", "Spinning", "Diving", "Hiding", "Exploring", "Marching",
  "Racing", "Floating", "Rolling", "Wandering", "Hopping", "Gliding", "Sliding", "Waving",
  "Skating", "Swinging", "Crawling", "Bouncing", "Sprinting", "Walking", "Parading", "Skipping",
  "Snoring", "Charging", "Leaping", "Winking", "Laughing", "Yawning", "Howling", "Barking",
  "Purring", "Buzzing", "Cheering", "Swaying", "Shining", "Fluttering", "Humming", "Drifting"
];

const subjects = [
  "Cat", "Dog", "Panda", "Robot", "Bird", "Fish", "Penguin", "Bear", "Monster", "Witch",
  "Dragon", "Alien", "Fairy", "Knight", "Dancer", "Singer", "Horse", "Dolphin", "Turtle", "Frog",
  "Lizard", "Sheep", "Wolf", "Bee", "Ant", "Spider", "Fox", "Deer", "Owl", "Shark",
  "Giraffe", "Octopus", "Chameleon", "Crocodile", "Crab", "Kangaroo", "Eagle", "Lion", "Snake", "Rabbit",
  "Unicorn", "Mermaid", "Magician", "Butterfly", "Snail", "Jellyfish", "Whale", "Mole", "PolarBear", "Cheetah"
];

// ===== 랜덤 조합 함수 =====
function getRandomWord(list) {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

function generateRandomTopic() {
  const background = getRandomWord(backgrounds);
  const action = getRandomWord(actions);
  const subject = getRandomWord(subjects);

  const format = Math.floor(Math.random() * 3); // 0, 1, 2 중 하나 랜덤

  if (format === 0) {
    return `${action} ${subject} in the ${background}`;
  } else if (format === 1) {
    return `A ${subject} that is ${action.toLowerCase()} in the ${background}`;
  } else {
    return `${action} ${subject} across the ${background}`;
  }
}

// ===== 컴포넌트 =====
function ChooseTopicPage() {
  const [topic, setTopic] = useState(generateRandomTopic());
  const [customInput, setCustomInput] = useState('');
  const navigate = useNavigate();

  const handleNext = () => {
    const roomId = uuidv4().slice(0, 8);
    navigate(`/draw/${roomId}`, { state: { topic: customInput || topic } });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Drawing's Topic 🎨</h2>
      <h1>"{topic}"</h1>

      <button 
        onClick={() => setTopic(generateRandomTopic())}
        style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        🎲 Pick Another
      </button>

      <div style={{ marginTop: '30px' }}>
        <input
          type="text"
          placeholder="Or type your own topic"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          style={{ padding: '8px', width: '250px', fontSize: '16px', marginTop: '10px' }}
        />
      </div>

      <button 
        onClick={handleNext}
        style={{ marginTop: '20px', padding: '10px 20px', fontSize: '18px', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        ✅ Draw with this topic
      </button>
    </div>
  );
}

export default ChooseTopicPage;
