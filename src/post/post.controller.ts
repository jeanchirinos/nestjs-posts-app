import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common'
import { Post as PostModel } from '@prisma/client'
import { PostService } from './post.service'

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getPublishedPosts(): Promise<PostModel[]> {
    return this.postService.posts({
      where: { published: true },
    })
  }

  @Get(':id')
  async getPostById(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    return this.postService.post({ id })
  }

  @Get('search/:searchString')
  async getFilteredPosts(@Param('searchString') searchString: string): Promise<PostModel[]> {
    return this.postService.posts({
      where: {
        OR: [
          {
            title: { contains: searchString },
          },
          {
            content: { contains: searchString },
          },
        ],
      },
    })
  }

  @Post()
  async createDraft(@Body() postData: { title: string; content?: string; authorEmail: string }): Promise<PostModel> {
    const { title, content, authorEmail } = postData
    return this.postService.createPost({
      title,
      content,
      author: {
        connect: { email: authorEmail },
      },
    })
  }

  @Patch('publish/:id')
  async publishPost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    return this.postService.updatePost({
      where: { id },
      data: { published: true },
    })
  }

  @Delete(':id')
  async deletePost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    return this.postService.deletePost({ id })
  }
}
