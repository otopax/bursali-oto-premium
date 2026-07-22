export class GetPostDataUseCase {
  /**
   * @param {import('../interfaces/IContentRepository').IContentRepository} contentRepository 
   */
  constructor(contentRepository) {
    this.contentRepository = contentRepository;
  }

  async execute(slug, folder = 'blog') {
    return await this.contentRepository.getPostData(slug, folder);
  }
}
