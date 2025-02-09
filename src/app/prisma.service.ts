import { Injectable } from '@angular/core';
import { PrismaClient } from '@prisma/client';

@Injectable({
  providedIn: 'root'
})
export class PrismaService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async addFlashcard(question: string, answer: string) {
    return this.prisma.flashcard.create({
      data: {
        question,
        answer
      }
    });
  }
}
