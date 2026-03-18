"use client";

import { LoaderCircle, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { searchLocationSuggestions } from "@/lib/maptiler";

type LocationAutocompleteProps = {
  id?: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
};

export function LocationAutocomplete({
  id,
  value,
  placeholder,
  disabled,
  onChange,
  onSelect,
  onKeyDown,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const timeoutId = window.setTimeout(async () => {
      const normalizedValue = value.trim();

      if (normalizedValue.length < 3) {
        setSuggestions([]);
        setIsLoading(false);
        setErrorMessage(null);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextSuggestions = await searchLocationSuggestions(normalizedValue);

        if (!isMounted) {
          return;
        }

        setSuggestions(nextSuggestions.filter((suggestion) => suggestion !== normalizedValue));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setSuggestions([]);
        setErrorMessage(error instanceof Error ? error.message : "Could not load suggestions.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [value]);

  function handleSelect(nextValue: string) {
    onChange(nextValue);
    onSelect?.(nextValue);
    setSuggestions([]);
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={id}
          placeholder={placeholder}
          className="h-13 rounded-[1.25rem] border-stone-200 bg-white px-4 pr-11"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
        />
        {isLoading ? (
          <LoaderCircle className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-stone-400" />
        ) : null}
      </div>

      {suggestions.length ? (
        <div className="overflow-hidden rounded-[1.25rem] border border-stone-200 bg-white shadow-[0_18px_40px_-34px_rgba(50,35,20,0.28)]">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="flex w-full items-start gap-3 border-b border-stone-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-stone-50"
              onClick={() => handleSelect(suggestion)}
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-stone-400" />
              <span className="text-sm text-stone-700">{suggestion}</span>
            </button>
          ))}
        </div>
      ) : null}

      {errorMessage ? <p className="px-1 text-sm text-stone-500">{errorMessage}</p> : null}
    </div>
  );
}
