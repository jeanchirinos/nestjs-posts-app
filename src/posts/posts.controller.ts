import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { Post as PostModel } from '@prisma/client'
// import { ApiKeyAuth } from 'src/auth/decorators/api-key-swagger.decorator'
import { Public } from 'src/auth/decorators/auth.decorator'
import { UserSession } from 'src/auth/types/session'
import { ResponseMessage } from 'src/response-message.decorator'
import { CurrentUser } from 'src/users/decorators/users.decorator'
import { PaginatedResult } from 'src/utils/paginator'
import { CreateDraftDto } from './dtos/createdraft.dto'
import { PostsService } from './posts.service'

@Controller()
// @ApiKeyAuth()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get('posts')
  @ApiTags('posts / public')
  @ApiOperation({ summary: 'Get published posts' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getPublishedPosts(
    @Query('page') page?: number,
    @Query('order') order?: 'asc' | 'desc',
    @Query('limit') limit?: number,
  ): Promise<PaginatedResult<PostModel>> {
    const paginationOrder = order === 'asc' ? 'asc' : 'desc'

    return this.postsService.posts({
      where: { published: true },
      page,
      orderBy: {
        publishedAt: paginationOrder,
      },
      limit,
    })
  }

  @Public()
  @Get('posts/:id')
  @ApiTags('posts / public')
  @ApiOperation({ summary: 'Get post published by id' })
  async getPostById(@Param('id') id: number): Promise<PostModel> {
    const post = await this.postsService.post({ id, published: true })

    if (!post) throw new NotFoundException('Post not found')

    return post
  }

  @Public()
  @Get('posts/search/:searchString')
  @ApiTags('posts / public')
  @ApiOperation({ summary: 'Search for posts' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getFilteredPosts(
    @Param('searchString') searchString: string,
    @Query('page') page?: number,
    @Query('order') order?: 'asc' | 'desc',
    @Query('limit') limit?: number,
  ): Promise<PaginatedResult<PostModel>> {
    const paginationOrder = order === 'asc' ? 'asc' : 'desc'

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
        published: true,
      },
      page,
      orderBy: {
        publishedAt: paginationOrder,
      },
      limit,
    })
  }

  @Public()
  @Get('user/:userId/posts')
  @ApiTags('posts / public')
  @ApiOperation({ summary: 'Get published posts by user' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getUserPosts(
    @Param('userId') userId: number,
    @Query('page') page?: number,
    @Query('order') order?: 'asc' | 'desc',
    @Query('limit') limit?: number,
  ): Promise<PaginatedResult<PostModel>> {
    const paginationOrder = order === 'asc' ? 'asc' : 'desc'

    return this.postsService.posts({
      where: {
        authorId: userId,
        published: true,
      },
      page,
      orderBy: {
        publishedAt: paginationOrder,
      },
      limit,
    })
  }

  // Auth
  @ApiBearerAuth()
  @Get('user/posts')
  @ApiTags('posts')
  @ApiOperation({ summary: `Get user's posts` })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['published', 'drafts'] })
  async getPostsByUser(
    @CurrentUser() user: UserSession,
    @Query('page')
    page?: number,
    @Query('order') order?: 'asc' | 'desc',
    @Query('limit') limit?: number,
    @Query('type') type?: 'published' | 'drafts',
  ): Promise<PaginatedResult<PostModel>> {
    const paginationOrder = order === 'asc' ? 'asc' : 'desc'

    const published = type === 'published' ? true : type === 'drafts' ? false : undefined

    return this.postsService.posts({
      where: {
        authorId: user.id,
        published,
      },
      page,
      orderBy: [
        {
          publishedAt: paginationOrder,
        },
        { updatedAt: paginationOrder },
      ],
      limit,
    })
  }

  @ApiBearerAuth()
  @Get('posts/:id/auth')
  @ApiTags('posts')
  @ApiOperation({ summary: 'Get post by id' })
  async getPostByIdAuth(@Param('id') id: number, @CurrentUser() user: UserSession): Promise<PostModel> {
    const post = await this.postsService.post({ id, authorId: user.id })

    if (!post) throw new NotFoundException('Post not found')

    return post
  }

  @ApiBearerAuth()
  @Post('posts')
  @ResponseMessage('Draft created successfully')
  @ApiTags('posts')
  @ApiOperation({ summary: 'Create a draft post' })
  async createDraft(@Body() postData: CreateDraftDto, @CurrentUser() user: UserSession): Promise<PostModel> {
    const { title, content } = postData

    const newPost = await this.postsService.createPost({
      title,
      content,
      author: {
        connect: { id: user.id },
      },
    })

    return newPost
  }

  @ApiBearerAuth()
  @Patch('posts/publish/:id')
  @ResponseMessage('Post published successfully')
  @ApiTags('posts')
  @ApiOperation({ summary: 'Publish a draft post' })
  async publishPost(@Param('id') id: number, @CurrentUser() user: UserSession): Promise<PostModel> {
    const post = await this.postsService.post({ id, authorId: user.id })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    if (post.published) {
      throw new BadRequestException('Post is already published')
    }

    try {
      const publishedPost = await this.postsService.updatePost({
        where: { id },
        data: { published: true },
      })

      return publishedPost
    } catch (error) {
      throw new InternalServerErrorException('Failed to publish post')
    }
  }

  @ApiBearerAuth()
  @Patch('posts/unpublish/:id')
  @ResponseMessage('Post unpublished successfully')
  @ApiTags('posts')
  @ApiOperation({ summary: 'Unpublish a post' })
  async unpublishPost(@Param('id') id: number, @CurrentUser() user: UserSession): Promise<PostModel> {
    const post = await this.postsService.post({ id, authorId: user.id })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    if (!post.published) {
      throw new BadRequestException('Post is not published')
    }

    try {
      const unPublishedPost = await this.postsService.updatePost({
        where: { id },
        data: { published: false },
      })

      return unPublishedPost
    } catch (error) {
      throw new InternalServerErrorException('Failed to unpublish post')
    }
  }

  @ApiBearerAuth()
  @Delete('posts/:id')
  @ResponseMessage('Post deleted successfully')
  @ApiTags('posts')
  @ApiOperation({ summary: 'Delete a post' })
  async deletePost(@Param('id') id: number, @CurrentUser() user: UserSession): Promise<PostModel> {
    const post = await this.postsService.post({ id, authorId: user.id })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    try {
      const deletedPost = await this.postsService.deletePost({ id })

      return deletedPost
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete post')
    }
  }
}
