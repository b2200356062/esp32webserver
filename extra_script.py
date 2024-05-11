import os
import subprocess

Import("env")

print ("Post upload scripts")

def buildweb(target, source, env):
    
    print("starting opera")
    # env.Execute("start Opera http://localhost:5173/")

    # env.Execute("cd vite && npm run dev")
    # print("vite app built")
    # env.Execute("exit")

    # try:
    #     os.chdir("angular/myapp")
    #     env.Execute("ng serve")
    #     print("web app built\n")
        

    # finally:
    #     os.chdir("..")

    # print("starting opera")
    # env.Execute("start Opera http://localhost:4200/")

    #print("Removing old SPIFFS image...")
    #env.Execute("rm -rf data")

    #print("Copying React App to SPIFFS...")
    #env.Execute("cp -r web/build data")

#env.AddPostAction("angular/myapp", buildweb)
#env.AddPostAction("$BUILD_DIR/spiffs.bin", buildweb)
# env.AddPostAction("upload", buildweb)