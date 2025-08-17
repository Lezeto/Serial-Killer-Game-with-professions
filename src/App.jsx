import React, { useState, useEffect } from "react";
import "./Game.css";

// Import images
import bootsImg from "./boots.png";
import varitaImg from "./varita.png";
import espadaImg from "./espada.png";
import picoImg from "./pico.png";
import anilloImg from "./anillo.png";
import libroImg from "./libro.png";
import gemaImg from "./gema.png";
import capaImg from "./capa.png";
import hatImg from "./sombrero.png";
import cascoImg from "./Casco.png";
import armorImg from "./armor.png";
import legsImg from "./legs.png";
import potionImg from "./potion.png";
import coinImg from "./coin.png";
import characterImg from "./character.png";
import shieldImg from "./Shield.png";

// Professions with starting stats
const professions = {
  Doctor: { hp: 100, strength: 5, agility: 10, intelligence: 20, luck: 5 },
  Lawyer: { hp: 90, strength: 8, agility: 12, intelligence: 18, luck: 7 },
  Priest: { hp: 110, strength: 6, agility: 8, intelligence: 15, luck: 12 },
  Banker: { hp: 95, strength: 7, agility: 10, intelligence: 22, luck: 6 },
  Athlete: { hp: 120, strength: 15, agility: 18, intelligence: 8, luck: 5 },
};

const Game = () => {
  const [profession, setProfession] = useState(null);
  const [character, setCharacter] = useState(null);

  const [missionResult, setMissionResult] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [cooldowns, setCooldowns] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  // Pick a profession
  const chooseProfession = (prof) => {
    setProfession(prof);
    const stats = professions[prof];
    setCharacter({
      hp: stats.hp,
      maxHp: stats.hp,
      strength: stats.strength,
      agility: stats.agility,
      intelligence: stats.intelligence,
      luck: stats.luck,
      level: 1,
      exp: 0,
      nextLevelExp: 100,
      goldCoins: 0,
      statPoints: 0,
      inventory: [],
      equipment: {
        helmet: null,
        armor: null,
        legs: null,
        boots: null,
        leftHand: null,
        rightHand: null,
      },
    });
  };

  // Heal over time
  useEffect(() => {
    if (!character) return;
    const interval = setInterval(() => {
      setCharacter((prev) => ({
        ...prev,
        hp: Math.min(prev.hp + 5, prev.maxHp),
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, [character]);

  // Cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns((prev) => ({
        easy: prev.easy > 0 ? prev.easy - 1 : 0,
        medium: prev.medium > 0 ? prev.medium - 1 : 0,
        hard: prev.hard > 0 ? prev.hard - 1 : 0,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Gain EXP and level up
  const gainExp = (exp) => {
    setCharacter((prev) => {
      let newExp = prev.exp + exp;
      let newLevel = prev.level;
      let newNextLevelExp = prev.nextLevelExp;
      let statPoints = prev.statPoints;

      while (newExp >= newNextLevelExp) {
        newExp -= newNextLevelExp;
        newLevel++;
        newNextLevelExp = Math.floor(newNextLevelExp * 1.3);
        statPoints += 5;
      }

      return {
        ...prev,
        exp: newExp,
        level: newLevel,
        nextLevelExp: newNextLevelExp,
        statPoints,
      };
    });
  };

  // Missions
  const goOnMission = (type) => {
    if (cooldowns[type] > 0 || !character) return;

    let duration = type === "easy" ? 5 : type === "medium" ? 10 : 20;
    let chance = type === "easy" ? 0.8 : type === "medium" ? 0.5 : 0.3;
    let rewardCoins = type === "easy" ? 5 : type === "medium" ? 15 : 30;
    let expGain = type === "easy" ? 30 : type === "medium" ? 70 : 150;

    setCooldowns((prev) => ({ ...prev, [type]: duration }));
    setMissionResult(`You went on a ${type} mission...`);

    setTimeout(() => {
      const success = Math.random() < chance + character.luck / 100;
      if (success) {
        let newItem = ["Sword", "Shield", "Potion", "Book", "Gem"][Math.floor(Math.random() * 5)];
        setCharacter((prev) => ({
          ...prev,
          goldCoins: prev.goldCoins + rewardCoins,
          inventory: [...prev.inventory, newItem],
        }));
        gainExp(expGain);
        setMissionResult(`Success! You got ${rewardCoins} coins and found a ${newItem}.`);
      } else {
        setCharacter((prev) => ({
          ...prev,
          hp: Math.max(prev.hp - 40, 0),
        }));
        setMissionResult("Mission failed! You took damage and returned empty handed.");
      }
    }, duration * 1000);
  };

  // Equip / Unequip
  const getItemImage = (item) => {
    switch (item) {
      case "Potion": return potionImg;
      case "Sword": return espadaImg;
      case "Shield": return shieldImg;
      case "Helmet": return cascoImg;
      case "Armor": return armorImg;
      case "Legs": return legsImg;
      case "Boots": return bootsImg;
      case "Book": return libroImg;
      case "Gem": return gemaImg;
      default: return null;
    }
  };

  // If no profession picked
  if (!character) {
    return (
      <div className="game-container">
        <h1>Choose Your Profession</h1>
        <div className="profession-buttons">
          {Object.keys(professions).map((prof) => (
            <button key={prof} onClick={() => chooseProfession(prof)}>
              {prof}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Game UI
  return (
    <div className="game-container">
      <div className="main-content">
        <div className="left-panel">
          <div className="character-section">
            <img src={characterImg} alt="Character" className="character-image" />
            <h2>{profession}</h2>
            <p>Level {character.level}</p>
            <p>HP: {character.hp}/{character.maxHp}</p>
            <p>Strength: {character.strength}</p>
            <p>Agility: {character.agility}</p>
            <p>Intelligence: {character.intelligence}</p>
            <p>Luck: {character.luck}</p>
            <p>Coins: {character.goldCoins}</p>
          </div>

          <div className="missions-section">
            <h2>Missions</h2>
            <button onClick={() => goOnMission("easy")} disabled={cooldowns.easy > 0}>
              Easy Mission {cooldowns.easy > 0 && `(${cooldowns.easy}s)`}
            </button>
            <button onClick={() => goOnMission("medium")} disabled={cooldowns.medium > 0}>
              Medium Mission {cooldowns.medium > 0 && `(${cooldowns.medium}s)`}
            </button>
            <button onClick={() => goOnMission("hard")} disabled={cooldowns.hard > 0}>
              Hard Mission {cooldowns.hard > 0 && `(${cooldowns.hard}s)`}
            </button>
            <p>{missionResult}</p>
          </div>
        </div>

        <div className="right-panel">
          <div className="inventory-section">
            <h2>Inventory</h2>
            <div className="inventory-grid">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="inventory-slot">
                  {character.inventory[i] && (
                    <img
                      src={getItemImage(character.inventory[i])}
                      alt={character.inventory[i]}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
