# AI vs World's Hardest Game!

This is a project aiming to train AIs to play (and successfully complete) levels in the World's Hardest Game using NEAT.
This project was inspired by Code Bullet's video on WHG and NEAT where he trained a series of vectors to play the game. While that approach is effective for searching for the solution to a single level, it does not generalize well to new levels. 

In comparison, this project uses NEAT to train neural networks to play the game, which allows them to potentially learn actions (such as dodging balls and locating food) that generalize to all levels.

The rendered HTML can be found [here](https://davidliii.github.io/Worlds-Hardest-Game-AI/): 

## How Does The Game Work

The game is played on a tile grid containing the following tile types: background (untraversable), neutral, home, and goal. The objective of the game is to reach the goal area starting from the home area while avoiding contact with moving obstacles (blue balls) and picking up food (yellow balls) along the way.

The level select dropdown allows users to choose existing levels to play on. Alternatively, custom levels can be created by following the instructions on the page. AI mode can be initiated by setting the population size and clicking "START AI". The next generation is created once an in-game timer reaches the limit or the user prematurely creates the next generation

# The AI

The agents in the game are controlled using NEAT, an genetic algorithm that produces neural networks through generations of cross-mating and mutations. The populations begin minimally (input and output layers are fully connected) and slowly evolve by altering the topology of the network by adding new nodes, creating new connections, and disabling old connections. Innovation is preserved through speciation. A fitness function allows for the algorithm to select better-performing members and allowing them to propagaate their genes to the next generation.
