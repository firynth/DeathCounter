# Overview
Trying to find a great death counter for Twitch is hard at times. Usually, what's available out there is really shoddy and does the job in a half-assed way. So I went ahead and coded my own version that acts like a bot as well. This will store all the variables locally to the browser source in OBS, so as long as you use the same OBS browser client, you will always have access to the data for the Death Counter. The neat thing about this death counter is that it won't just track total deaths, but it'll also track deaths on bosses as well. So if you're curious how badly you did on particular bosses after beating a game, you'll get detailed stats on total deaths plus deaths for each boss.

This death counter also allows for saving a death counter for one game and starting another game that needs a death counter, then loading the data back into the death counter for the saved game. Meaning you can change games at whim, as long as you don't overflow the browser local storage character limit.

Commands that alter what's displayed in the stream will be locked down until the animations finish. Meaning if you add a death, the animation has to finish before another one can be added. This prevents things like two mods adding a death at the same time, as the animation for the first command to trigger the death counter has to finish before a new command can be accepted.

Currently, I only know that this works for OBS-Studio completely. There are no plans to support StreamLabs OBS or XSplit, but it doesn't mean that some of the features of the Death Counter won't work in either. Try what you can and see what works. The only thing I know that doesn't work in StreamLabs OBS at this point is the AutoHotKey script/executable. I have not been told if the other portions of the bot don't work.

# Installation
Make sure all the files are in the same folder, otherwise, the program will fail.

Step 1 - Config file needs to be edited with the information specified in config.js. 

Step 2 - Add the HTML file to OBS Studio as a "Browser Source" with the settings in this [image](https://i.imgur.com/oTsVOzc.png) This is the optimal settings for the death counter display, you can resize it in the OBS preview after the fact, if you want it smaller or bigger. The checked boxes prevent it from being updated when you're not using it by hiding it (you can click the eye icon to not show it to the stream and kill the bot) and ensures that the data is loaded correctly when you unhide it and that the bot is actively seeing the chat in your channel. If the config file is set up correctly and everything is working, you can type !dc (or whatever the command you specified) in your chat and the bot will reply.

Step 3 - Right click the Browser Source you just added and go to "Filters". Once the window for filters opens up, you want to add a "Color Key" filter. Change "Key Color Type" to "Custom Color" and select black. This will chroma out the black background and make it transparent so that the stuff behind the death counter can be visible to the stream.

Note - Sometimes while fooling with this, you will need to hit the "Refresh Cache" button under the browser source properties and then cancel out of the window. This typically fixes the bot if it's being unresponsive.

You can change the font of the text by editting the .css file. I have it defaulted to Ultima's Avatar font, which can be found at the following [link](http://www.thealmightyguru.com/GameFonts/Series-Ultima.html). Just download the font and drop it in the folder with the other files.

# Commands 
There are several default commands I've added to the bot portion of the death counter. This is an explanation of the commands.

  ## +|-|set (num)
  This should be fairly intuitive, but just to explain. + will increase the deaths, - will decrease the deaths, and set will set the **TOTAL DEATHS** to the number specified. Set requires that the new number be greater than the currently displayed amount in order to work. <num> is the number to increase/decrease/set the total deaths to. If no number is specified, it will increase/decrease by 1 and spit out an error message for set.
  ## newboss (bossname)
  This command will create a new boss to track the number of deaths for. You can give it whatever name you want. The counter will update to display that you are currently fighting this boss and usage of +|-|set will also increase the deaths for this boss. Boss names have to be unique, so if you fight the same boss multiple times, you will need to add extra identifiers like "Boss #2" or whatever you want.
  You can also start a new boss without clearing a boss. Useful if you find a boss too hard and you go exploring and find another boss to fight. Create the new boss and the other boss will be saved off to be resumed later when you end up back at it.
  ## changename (bossname)
  This command allows you to change the current boss' name from what you specified, to something else. As long as the boss isn't cleared (next command). Still abides by the unique rule. Use list to see the names of bosses you have already used.
  ## boss (clear)
  Boss without the clear argument, meaning if you use anything else but clear, will toggle the boss portion of the death counter from showing. When the boss portion is shown, the deaths for the boss will update. When it's not shown, only total deaths will be updated. This is useful if you find you need to backtrack through a hard area so that the deaths you may encounter there won't be added to the boss.
  The clear argument finalizes your attempts against the boss and locks down the boss from further editting. This will auto-hide the boss section of the death counter and spit out some text to chat
  ## resume (bossname)
  Resumes a boss that hasn't been finished yet. The name needs to be the same as what was used when it was created with newboss. Use list to see the names of bosses you've used if you've forgotten it.
  ## list
  This displays a list of bosses in the death counter and the deaths for each boss. Useful for resuming bosses or just seeing where your deaths have been when talking to chat.
  ## gamename (game name)
  This feature gives the current death counter a name you specify. This is used for saving a death counter so that it can be loaded at a later time.
  ## save
  If the current death counter was given a game name, this saves the death counter to storage and resets the death counter so you can use it for another game.
  ## load (game name)
  This will load a previously saved death counter, allowing you to resume tracking deaths when you start up attempts on a game you previously shelved for whatever reason. If the current death counter has a name, it will save it to storage and load the other counter. If it doesn't have a name, the death counter has to be reset or given a name in order to use this function.
  ## gamelist
  Shows a list of saved death counter names so that you can use load to reload the data for that death counter back into active memory.
  ## reset
  Resets the currently active death counter to 0. This will clear everything, including the game name and the death counter from the list of saved games.
  ## finish
  This locks the death counter down completely. You cannot do anything with this death counter other than reset it. This will also output the total deaths and a list of bosses and deaths for each boss to chat as well.
  ## fullreset
  Completely clears out everything for the death counter. The currently displayed counter and any saved game data as well.
  
  ## Broadcaster Only Commands
  ### enablemod
  Mods are able to use the death counter innately. If you don't want your mods to be able to use the death counter commands, use this to disable their ability to use it. If it is disabled, you can use this commands to re-enable the ability for mods to use the death counter commands.
  ### adduser/deluser (user)
  Specify the Twitch name of a user and this person will be allowed to use the death counter without needing to be a mod, or be able to use it if you have disabled mods being able to use innately. Add will add the user. Del will delete the user from the list.

# Autohotkey (.ahk) file
There's an .ahk file in the included files that I use to update deaths on my end without typing in chat. This uses a neat feature of OBS-Studio that allows you to interact with Browser Sources that are in your scenes. If you have AutoHotKey installed, you can run the .ahk file by itself (run as admin), otherwise, download this [.exe file](https://www.dropbox.com/s/giedk1q64da168v/DeathCounter.exe?dl=0) and run that as an administrator.

To get it to work, you need to right click on the death counter browser source and select Interact. This will open up a new window. You can hide this behind something else on your screen, as long as it is open. With the .ahk file or .exe file running, you can press the following keys to update the death counter in various ways.
## F2
Does the same thing as the "boss clear" command.
## F4
Does the same thing as the "boss" command without the clear argument.
## F5
Reduces the deaths, and boss if toggled, by one
## F6
Increases the deaths, and boss if toggled, by one
