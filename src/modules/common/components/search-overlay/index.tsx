// src/modules/common/components/search-overlay/index.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import SearchBox from "./search-box";
import { IoCloseSharp } from "react-icons/io5";
import classNames from "classnames";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ open, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened; clear value when closed
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setSearchTerm("");
    }
  }, [open]);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/search?query=${encodeURIComponent(searchTerm)}`;
    }
    onClose();
  };

  const handleClear = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (searchTerm) {
      setSearchTerm("");
      inputRef.current?.focus();
    } else {
      onClose();
    }
  };

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setSearchTerm(e.currentTarget.value);
  };

  if (!open) return null;

  return (
    <div className={classNames("search-overlay", { open })} onClick={(e) => e.stopPropagation()}>
      <SearchBox
        ref={inputRef}
        onSubmit={handleSubmit}
        onClear={handleClear}
        onChange={handleChange}
        name="search"
        value={searchTerm}
      />
    </div>
  );
};

export default SearchOverlay;