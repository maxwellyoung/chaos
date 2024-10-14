"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Shuffle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";

type Player = {
  name: string;
  avatar: string;
  score: number;
};

type GameMode = "free" | "competitive" | "survival";
type ThemePack = "party" | "chill" | "wild";

const initialPrompts = {
  party: [
    "{player1}, show us your best dance move!",
    "{player1}, choose two players to have a 10-second staring contest.",
    "{player1} and {player2}, race to see who can stack five objects the fastest.",
    "Everyone vote: Who's most likely to become a celebrity, {player1} or {player2}?",
    "{player1}, without using words, act out your favorite hobby and let the group guess!",
    "{player1}, choose a player to do an impression of you for the next round.",
    "{player1} and {player2}, argue why each of you is the best dancer. The group will vote on the winner!",
    "The person with the shortest name must swap seats with {player1}!",
    "{player1}, you're the storyteller! Tell a 30-second story, and {player2} must act it out.",
    "Everyone except {player1}, do your best impression of them!",
  ],
  chill: [
    "{player1}, what's the most valuable life lesson you've learned so far?",
    "{player1}, if you could have dinner with any historical figure, who would it be and why?",
    "{player1} and {player2}, share one thing you admire about each other.",
    "Everyone share: What's a small act of kindness {player1} has done for you?",
    "{player1}, describe your perfect day from start to finish.",
    "{player1}, what's a skill you'd love to master and why?",
    "{player1} and {player2}, if you could switch lives for a day, what would you be most excited to experience?",
    "Group vote: Who gives the best advice, {player1} or {player2}?",
    "{player1}, share a book that changed your perspective on life.",
    "Everyone take turns: What's one word you'd use to describe {player1}?",
  ],
  wild: [
    "{player1}, do your best impression of a celebrity for 30 seconds!",
    "{player1}, let {player2} draw anything they want on your face with a marker.",
    "{player1} and {player2}, have a rap battle about the last thing you ate!",
    "Everyone except {player1}, try to make them laugh. First to succeed gets a point!",
    "{player1}, call the 5th contact in your phone and sing them happy birthday.",
    "{player1}, let the group pose you for a ridiculous photo to post on social media.",
    "{player1} and {player2}, switch clothes for the next three rounds!",
    "Group challenge: First to bring {player1} an embarrassing item from their home wins!",
    "{player1}, eat a spoonful of the spiciest condiment available.",
    "Everyone mimic {player1}'s laugh at the same time for 10 seconds!",
  ],
};

export function PersonalizedPartyGameComponent() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [gameState, setGameState] = useState<"setup" | "playing">("setup");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [gameMode, setGameMode] = useState<GameMode | "">("");
  const [themePack, setThemePack] = useState<ThemePack>("party");
  const [customPrompt, setCustomPrompt] = useState("");
  const [prompts, setPrompts] = useState(initialPrompts);
  const [error, setError] = useState("");
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const avatarSeed = Math.floor(Math.random() * 1000);
      setPlayers([
        ...players,
        {
          name: newPlayerName.trim(),
          avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${avatarSeed}`,
          score: 0,
        },
      ]);
      setNewPlayerName("");
    }
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const startGame = () => {
    if (players.length < 2) {
      setError("Please add at least 2 players to start the game.");
      return;
    }
    if (!gameMode) {
      setError("Please select a game mode.");
      return;
    }
    setError("");
    setGameState("playing");
    nextPrompt();
  };

  const nextPrompt = () => {
    const currentPrompts = prompts[themePack];
    let prompt =
      currentPrompts[Math.floor(Math.random() * currentPrompts.length)];
    const playerNames = players.map((p) => p.name);
    const player1 = playerNames[currentPlayerIndex];
    let player2 = player1;
    while (player2 === player1) {
      player2 = playerNames[Math.floor(Math.random() * playerNames.length)];
    }
    prompt = prompt.replace("{player1}", player1).replace("{player2}", player2);
    setCurrentPrompt(prompt);

    if (gameMode === "competitive" || gameMode === "survival") {
      setPlayers((prevPlayers) =>
        prevPlayers.map((player, index) =>
          index === currentPlayerIndex
            ? { ...player, score: player.score + 1 }
            : player
        )
      );
    }

    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);

    if (gameMode === "survival") {
      const lowestScore = Math.min(...players.map((p) => p.score));
      if (players[currentPlayerIndex].score > lowestScore + 2) {
        setPlayers((prevPlayers) =>
          prevPlayers.filter((_, index) => index !== currentPlayerIndex)
        );
        if (players.length <= 2) {
          endGame();
        }
      }
    }
  };

  const addCustomPrompt = () => {
    if (customPrompt.trim()) {
      setPrompts((prevPrompts) => ({
        ...prevPrompts,
        [themePack]: [...prevPrompts[themePack], customPrompt.trim()],
      }));
      setCustomPrompt("");
    }
  };

  const exitGame = () => {
    setGameState("setup");
    setCurrentPrompt("");
    setPlayers(players.map((player) => ({ ...player, score: 0 })));
    setCurrentPlayerIndex(0);
  };

  const endGame = () => {
    let winner;
    if (gameMode === "competitive") {
      winner = players.reduce((prev, current) =>
        prev.score > current.score ? prev : current
      );
    } else if (gameMode === "survival") {
      winner = players[0];
    }
    setCurrentPrompt(`Game Over! ${winner ? `${winner.name} wins!` : ""}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#333333] p-4 flex flex-col font-mono">
      {gameState === "setup" && (
        <div className="flex-grow flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl font-bold mb-8">SOCIAL CHAOS</h1>
          <div className="space-y-4 w-full max-w-md">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-[#FF6B6B] hover:bg-[#FF8E8E] text-white">
                  Add Player
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Add New Player</DialogTitle>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                  <Input
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPlayer();
                      }
                    }}
                    placeholder="Enter player name"
                  />
                  <Button
                    onClick={addPlayer}
                    type="button"
                    className="bg-[#4ECDC4] hover:bg-[#45B7AC] text-white"
                  >
                    Add
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Select onValueChange={(value: GameMode) => setGameMode(value)}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select Game Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free Play</SelectItem>
                <SelectItem value="competitive">Competitive</SelectItem>
                <SelectItem value="survival">Survival</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value: ThemePack) => setThemePack(value)}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select Theme Pack" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="party">Party Mode</SelectItem>
                <SelectItem value="chill">Chill Mode</SelectItem>
                <SelectItem value="wild">Wild Mode</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={startGame}
              className="w-full bg-[#4ECDC4] hover:bg-[#45B7AC] text-white"
            >
              Start Game
            </Button>
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4 w-full max-w-md">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {players.length > 0 && (
            <div className="mt-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Players:</h2>
              <div className="grid grid-cols-2 gap-4">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-2 rounded border border-[#333333]"
                  >
                    <div className="flex items-center">
                      <Image
                        src={player.avatar}
                        alt={player.name}
                        width={40}
                        height={40}
                        className="rounded-full mr-2"
                      />
                      <span>{player.name}</span>
                    </div>
                    <Button
                      onClick={() => removePlayer(index)}
                      variant="ghost"
                      size="sm"
                      className="text-[#FF6B6B]"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {gameState === "playing" && (
        <div className="flex-grow flex flex-col justify-between items-center text-center">
          <div className="w-full flex justify-between items-center p-4">
            <Button
              onClick={exitGame}
              variant="ghost"
              className="text-[#FF6B6B]"
            >
              <X size={24} />
            </Button>
            <span className="text-xl font-bold">
              {gameMode === "free"
                ? "Free Play"
                : gameMode === "competitive"
                ? "Competitive Mode"
                : "Survival Mode"}
            </span>
            <Button
              onClick={nextPrompt}
              variant="ghost"
              className="text-[#4ECDC4]"
            >
              <Shuffle size={24} />
            </Button>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <p className="text-3xl font-bold px-4">{currentPrompt}</p>
          </div>
          {gameMode !== "free" && (
            <div className="w-full max-w-md mb-4">
              <h3 className="text-xl font-bold mb-2">Scores:</h3>
              {players.map((player, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center mb-2"
                >
                  <span>{player.name}</span>
                  <span>{player.score}</span>
                </div>
              ))}
            </div>
          )}
          <div className="w-full max-w-md mb-4">
            <Input
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter a custom prompt"
              className="mb-2 bg-white"
            />
            <Button
              onClick={addCustomPrompt}
              className="w-full bg-[#FF6B6B] hover:bg-[#FF8E8E] text-white"
            >
              Add Custom Prompt
            </Button>
          </div>
          <Button
            onClick={nextPrompt}
            className="mb-8 bg-[#4ECDC4] hover:bg-[#45B7AC] text-white text-xl py-3 px-6"
          >
            Next Prompt
          </Button>
        </div>
      )}
    </div>
  );
}
