import { MarkdownContentRepository } from '@/infrastructure/repositories/MarkdownContentRepository';
import { GetSortedPostsUseCase } from '@/application/use-cases/GetSortedPostsUseCase';
import { GetPostDataUseCase } from '@/application/use-cases/GetPostDataUseCase';
import { GetPostPathsUseCase } from '@/application/use-cases/GetPostPathsUseCase';
import { HierarchyBuilder } from '@/application/use-cases/HierarchyBuilder';
import { GoogleAiProvider } from '@/infrastructure/ai/GoogleAiProvider';
import { ChatService } from '@/services/ChatService';
import { VisionService } from '@/services/VisionService';

// Dependency Injection Container (Singleton)
class DIContainer {
  constructor() {
    // Providers
    this.aiProvider = new GoogleAiProvider();

    // Repositories
    this.contentRepository = new MarkdownContentRepository();

    // Use Cases
    this.getSortedPostsUseCase = new GetSortedPostsUseCase(this.contentRepository);
    this.getPostDataUseCase = new GetPostDataUseCase(this.contentRepository);
    this.getPostPathsUseCase = new GetPostPathsUseCase(this.contentRepository);
    this.hierarchyBuilder = new HierarchyBuilder(this.contentRepository);
    
    // Services
    this.chatService = new ChatService(this.aiProvider);
    this.visionService = new VisionService(this.aiProvider);
  }
}

export const container = new DIContainer();
