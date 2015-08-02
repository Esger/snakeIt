# snakeIt

A calculation game, combined with elements of Snake - the game we all know.

## game play

Click or tap tiles adjacent to the head of the snake (the green tile in the center of the board).
Alternatively you can steer the head of the snake with the numerical keys.
Try to move the snake over numbers and 'operator' characters to form valid equations, like 1+1=2.
The tiles are evaluated starting at the head, but they do not need to cover the whole length of the snake.
When a valid equation is formed, this tiles disappear, shortening your snake. The last tile at the tail is cut off as well, if possible.
The tiles above this will fall down and new random tiles will be inserted from the top.

## scoring

The longer the valid part of the snake, the more point you score.
Your high score will be kept in a browser-cookie.

## game end

The game ends when you try to steer the snake out of the board (hit a wall) or when the snake hits itself.
When no more '=' signs are available, the game ends as well.
