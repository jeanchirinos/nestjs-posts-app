import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Post as PostModel } from '@prisma/client'
import { Public } from 'src/auth/decorators/auth.decorator'
import { IsOwnerGuard } from 'src/auth/guards/is-owner'
import { CurrentUser } from 'src/users/decorators/users.decorator'
import { PaginatedResult } from 'src/utils/paginator'
import { PostsService } from './posts.service'

@ApiTags('posts')
@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get('posts')
  async getPublishedPosts(@Query('page') page?: number): Promise<PaginatedResult<PostModel>> {
    return this.postsService.posts({
      where: { published: true },
      page,
    })
  }

  @UseGuards(IsOwnerGuard)
  @Get('user/:userId/posts')
  async getPostsByUser(
    @Param('userId') userId: number,
    @Query('page') page: number,
  ): Promise<PaginatedResult<PostModel>> {
    return this.postsService.posts({
      where: {
        authorId: userId,
      },
      page,
    })
  }

  @Get('posts/:id')
  async getPostById(@Param('id') id: number): Promise<PostModel> {
    const post = await this.postsService.post({ id })

    if (!post) throw new NotFoundException('Post not found')

    return post
  }

  @Get('posts/search/:searchString')
  async getFilteredPosts(
    @Param('searchString') searchString: string,
    @Query('page') page?: number,
  ): Promise<PaginatedResult<PostModel>> {
    return this.postsService.posts({
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
      page,
    })
  }

  @Post()
  async createDraft(@Body() postData: { title: string; content?: string }, @CurrentUser() user): Promise<PostModel> {
    const { title, content } = postData

    return this.postsService.createPost({
      title,
      content,
      author: {
        connect: { id: user.id },
      },
    })
  }

  @Patch('posts/publish/:id')
  async publishPost(@Param('id') id: number): Promise<PostModel> {
    return this.postsService.updatePost({
      where: { id },
      data: { published: true },
    })
  }

  @Delete('posts/:id')
  async deletePost(@Param('id') id: number): Promise<PostModel> {
    return this.postsService.deletePost({ id })
  }
}
