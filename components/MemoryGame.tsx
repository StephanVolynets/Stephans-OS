"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';
import { toast } from 'sonner';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎯', '🎲', '🎮', '🎨', '🎭'];

export function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const initializeGame = () => {
    const shuffledCards = [...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setGameStarted(true);
  };

  const handleCardClick = (cardId: number) => {
    if (
      isChecking ||
      flippedCards.length === 2 ||
      flippedCards.includes(cardId) ||
      cards[cardId].isMatched
    ) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setMoves(prev => prev + 1);

      const [firstCard, secondCard] = newFlippedCards.map(id => cards[id]);
      
      if (firstCard.emoji === secondCard.emoji) {
        setCards(prev =>
          prev.map(card =>
            newFlippedCards.includes(card.id)
              ? { ...card, isMatched: true }
              : card
          )
        );
        setFlippedCards([]);
        setIsChecking(false);

        // Check if all cards are matched
        const allMatched = cards.every(
          (card, index) =>
            card.isMatched || newFlippedCards.includes(index)
        );
        
        if (allMatched) {
          if (!bestScore || moves + 1 < bestScore) {
            setBestScore(moves + 1);
          }
          toast.success(`Congratulations! You won in ${moves + 1} moves!`);
        }
      } else {
        setTimeout(() => {
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    initializeGame();
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-4 h-full">
      <div className="flex items-center justify-between w-full">
        <div className="space-y-1">
          <div className="text-lg font-semibold">
            Moves: <span className="text-primary">{moves}</span>
          </div>
          {bestScore && (
            <div className="text-sm text-muted-foreground">
              Best: <span className="text-primary">{bestScore}</span> moves
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={initializeGame}
          className="h-8 w-8"
        >
          <Shuffle className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 p-4 rounded-lg border bg-muted/50">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              h-20 w-20 text-3xl rounded-lg transition-all duration-300 transform
              ${
                card.isMatched || flippedCards.includes(card.id)
                  ? 'bg-primary/10 rotate-0'
                  : 'bg-primary/5 rotate-180'
              }
              hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed
            `}
            disabled={card.isMatched || isChecking}
          >
            <span
              className={`
                block transition-all duration-300 transform
                ${
                  card.isMatched || flippedCards.includes(card.id)
                    ? 'rotate-0 opacity-100'
                    : 'rotate-180 opacity-0'
                }
              `}
            >
              {card.emoji}
            </span>
          </button>
        ))}
      </div>

      <p className="text-sm text-center text-muted-foreground">
        Find matching pairs of emojis in the fewest moves possible!
      </p>
    </div>
  );
}