"""
NLP Preprocessing Module

This module provides text preprocessing utilities using spaCy for
tokenization, POS tagging, dependency parsing, and text normalization.
"""

import re
from typing import List, Dict, Any, Optional, Tuple

import spacy
from spacy.tokens import Doc, Token
from spacy.lang.en import English


class TextPreprocessor:
    """
    Handles text preprocessing for requirement analysis using spaCy.

    Provides utilities for:
    - Text normalization and cleaning
    - Tokenization with POS tagging
    - Dependency parsing
    - Named entity recognition
    - Sentence segmentation
    """

    def __init__(self, nlp_model: str = "en_core_web_sm"):
        """
        Initialize the text preprocessor.

        Args:
            nlp_model: spaCy language model to use
        """
        try:
            self.nlp = spacy.load(nlp_model)
        except OSError:
            # Fallback to blank model if en_core_web_sm not available
            self.nlp = spacy.blank("en")
            # Add basic pipeline components for English
            if "en" in nlp_model:
                self.nlp.add_pipe("sentencizer")

    def preprocess_text(self, text: str) -> Dict[str, Any]:
        """
        Perform complete preprocessing of input text.

        Args:
            text: Raw input text

        Returns:
            Dictionary containing processed text components
        """
        # Clean and normalize text
        cleaned_text = self.clean_text(text)

        # Process with spaCy
        doc = self.nlp(cleaned_text)

        return {
            "original_text": text,
            "cleaned_text": cleaned_text,
            "sentences": self.extract_sentences(doc),
            "tokens": self.extract_tokens(doc),
            "pos_tags": self.extract_pos_tags(doc),
            "dependencies": self.extract_dependencies(doc),
            "entities": self.extract_entities(doc)
        }

    def clean_text(self, text: str) -> str:
        """
        Clean and normalize input text.

        Args:
            text: Raw input text

        Returns:
            Cleaned and normalized text
        """
        if not text:
            return ""

        # Convert to string if needed
        text = str(text)

        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text.strip())

        # Remove excessive punctuation but keep meaningful ones
        text = re.sub(r'[^\w\s\.\,\!\?\:\;\-\(\)]', '', text)

        # Fix spacing around punctuation
        text = re.sub(r'\s+([.,!?;:])', r'\1', text)
        text = re.sub(r'([.,!?;:])\s+', r'\1 ', text)

        return text

    def extract_sentences(self, doc: Doc) -> List[str]:
        """
        Extract sentences from processed document.

        Args:
            doc: spaCy processed document

        Returns:
            List of sentence strings
        """
        return [sent.text.strip() for sent in doc.sents if sent.text.strip()]

    def extract_tokens(self, doc: Doc) -> List[Dict[str, Any]]:
        """
        Extract token information from processed document.

        Args:
            doc: spaCy processed document

        Returns:
            List of token dictionaries with metadata
        """
        tokens = []

        for token in doc:
            token_info = {
                "text": token.text,
                "lemma": token.lemma_,
                "pos": token.pos_,
                "tag": token.tag_,
                "dep": token.dep_,
                "is_alpha": token.is_alpha,
                "is_stop": token.is_stop,
                "start_char": token.idx,
                "end_char": token.idx + len(token.text)
            }
            tokens.append(token_info)

        return tokens

    def extract_pos_tags(self, doc: Doc) -> List[Tuple[str, str]]:
        """
        Extract POS tags from processed document.

        Args:
            doc: spaCy processed document

        Returns:
            List of (token, pos_tag) tuples
        """
        return [(token.text, token.pos_) for token in doc]

    def extract_dependencies(self, doc: Doc) -> List[Dict[str, Any]]:
        """
        Extract dependency relations from processed document.

        Args:
            doc: spaCy processed document

        Returns:
            List of dependency relation dictionaries
        """
        dependencies = []

        for token in doc:
            dep_info = {
                "token": token.text,
                "dep": token.dep_,
                "head": token.head.text,
                "head_pos": token.head.pos_,
                "children": [child.text for child in token.children]
            }
            dependencies.append(dep_info)

        return dependencies

    def extract_entities(self, doc: Doc) -> List[Dict[str, Any]]:
        """
        Extract named entities from processed document.

        Args:
            doc: spaCy processed document

        Returns:
            List of entity dictionaries
        """
        entities = []

        for ent in doc.ents:
            entity_info = {
                "text": ent.text,
                "label": ent.label_,
                "start_char": ent.start_char,
                "end_char": ent.end_char,
                "confidence": getattr(ent, '_.confidence', None)
            }
            entities.append(entity_info)

        return entities

    def get_keywords(self, doc: Doc, top_n: int = 10) -> List[Tuple[str, float]]:
        """
        Extract important keywords from document.

        This is a simple implementation using term frequency.
        In production, this could use TF-IDF or other methods.

        Args:
            doc: spaCy processed document
            top_n: Number of top keywords to return

        Returns:
            List of (keyword, score) tuples
        """
        # Simple keyword extraction based on noun phrases and proper nouns
        keywords = {}

        for token in doc:
            if (token.pos_ in ['NOUN', 'PROPN'] and
                not token.is_stop and
                len(token.text) > 2):

                # Simple scoring based on position and length
                score = 1.0
                if token.i < 5:  # Early in text
                    score += 0.5
                if len(token.text) > 4:  # Longer words
                    score += 0.3

                keywords[token.lemma_] = keywords.get(token.lemma_, 0) + score

        # Sort by score and return top N
        sorted_keywords = sorted(keywords.items(), key=lambda x: x[1], reverse=True)
        return sorted_keywords[:top_n]

    def detect_language(self, text: str) -> str:
        """
        Detect the language of input text.

        This is a simple implementation. In production, use a proper
        language detection library.

        Args:
            text: Input text

        Returns:
            Detected language code (default: 'en')
        """
        # Simple heuristic - check for common English words
        english_indicators = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']

        words = text.lower().split()
        english_count = sum(1 for word in words if word in english_indicators)

        if english_count > len(words) * 0.1:  # At least 10% English indicators
            return 'en'

        return 'unknown'

    def get_text_stats(self, doc: Doc) -> Dict[str, Any]:
        """
        Get basic statistics about the processed text.

        Args:
            doc: spaCy processed document

        Returns:
            Dictionary with text statistics
        """
        return {
            "sentence_count": len(list(doc.sents)),
            "token_count": len(doc),
            "word_count": sum(1 for token in doc if token.is_alpha),
            "unique_words": len(set(token.lemma_.lower() for token in doc if token.is_alpha)),
            "avg_word_length": sum(len(token.text) for token in doc if token.is_alpha) / max(1, sum(1 for token in doc if token.is_alpha)),
            "pos_distribution": self._get_pos_distribution(doc)
        }

    def _get_pos_distribution(self, doc: Doc) -> Dict[str, int]:
        """Get distribution of POS tags in the document."""
        pos_counts = {}

        for token in doc:
            pos_counts[token.pos_] = pos_counts.get(token.pos_, 0) + 1

        return pos_counts