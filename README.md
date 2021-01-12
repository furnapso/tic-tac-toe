# tic-tac-toe
## The Odin Project: Tic-Tac-Toe
Assignment for [The Odin Project](https://www.theodinproject.com) - Tic-Tac-Toe

## Technologies used
* HTML
* Javascript
* CSS
* [marx.css](https://mblode.github.io/marx/)

## Attributes
* Icons by [Pixel perfect](https://www.flaticon.com/authors/pixel-perfect)
* Icons by [Freepik](https://www.flaticon.com/authors/freepik)
* Icons by [gorbachev](https://www.flaticon.com/authors/vitaly-gorbachev)

## Screenshots
![Tic-tac-toe screenshot](./images/screenshot.png)

## Demo
You can view a live demo [here](https://furnapso.github.io/tic-tac-toe/)

## Thoughts & Learnings
On my previous projects, I spent a lot of time in CSS making things just look barely passable. For this project, I decided to try to minimize this by using a barebones CSS library in order to get the basic UI done rapidly, while still looking good (if you need a classless CSS library, marx.css is great).

The basic player vs. player part of the tic-tac-toe was pretty straightforward, however, when I came back to add the AI, I found gaps in the way that I had designed the objects - I had put way too much game logic in the board object, which resulted in me writing code that had the AI player interacting with the gameboard via simulated click events on the web page - something that I definitely need to go back and refactor, but for the time being, I am going to take a break from this project 😁

The minimax function took a number of youtube videos, and looking at other people's code to understand, but once it 'clicked' it felt really intuitive. Once again, the challenge with implementing this was decoupling my poorly-siloed code to get the game to behave in the way that I needed.

All in all, this project was quite challenging for me, but I never felt that it was impossible.