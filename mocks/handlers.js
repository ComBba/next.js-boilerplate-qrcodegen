import { rest } from 'msw'

const handlers = [
  rest.post('/api/generate', (req, res, ctx) => {
    // You can add checks for req.body here if necessary

    return res(
      ctx.json({
        filename: 'testQR.png', // Put a filename of an actual image file in your public/images directory
      }),
    )
  }),
]

export const server = setupServer(...handlers)
