var cubeRotation = 0.0;
var cam_speed = 0.125;

main();

// Start here

var KeyboardHelper = { left: 37, up: 32, right: 39, down: 40 , greyscale:71, flash:70};
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var greyscaleP = false;
var flashing = false, flash_count = 0;
var collided_somewhere = true, col_time_count=0, col_esc_time = 200;
var jet_boost = false, jet_count=0, jet_duration = 200;
var speed_booster = false, speed_boost_count=0, speed_boost_duration = 200;
var boot_jump = false, boot_count=0, boot_duration = 200;
var on_train = false;

function keyDownHandler(event) {
    if(event.keyCode == KeyboardHelper.right) {
        rightPressed = true;
    }
    if(event.keyCode == KeyboardHelper.left) {
        leftPressed = true;
    }
    if(event.keyCode == KeyboardHelper.down) {
      downPressed = true;
    }
    if(event.keyCode == KeyboardHelper.up) {
      upPressed = true;
    }
    if(event.keyCode == KeyboardHelper.greyscale) {
      if(greyscaleP==false) {
        greyscaleP = true;
        flashing = false;
      }
      else greyscaleP = false;
    }
    if(event.keyCode == KeyboardHelper.flash) {
      if(flashing==false) {
        flash_count = 0;
        flashing = true;
        greyscaleP = false;
      }
      else flashing = false;
    }
}

function keyUpHandler(event) {
    if(event.keyCode == KeyboardHelper.down) {
      downPressed = false;
    }
}

function append_coins_after_jetpack(gl,posi){
  //jetpack length 20
  for(var i=posi-9; i>=posi-29;i-=4) coins.push(new coin(gl, [0, 6, i],'media/coin.png'));
  for(var i=posi-33; i>=posi-59;i-=4) coins.push(new coin(gl, [3, 6, i],'media/coin.png'));
  for(var i=posi-63; i>=posi-99;i-=4) coins.push(new coin(gl, [-3, 6, i],'media/coin.png'));
}

function main() {
  const canvas = document.querySelector("#glcanvas");
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  // If we don't have a GL context, give up now 

  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  c = new cube(gl, [0, 0.75, 3.0],'media/player.jpeg');
  pol = new police(gl, [0, 0.5, 4.0],'media/policeman.png');
  rails = [];  rails2 = []; rails3 = [];
  wall1 = [];  wall2 = [];
  trains = []; small_obstacles = []; large_obstacles = [];
  jetpacks = []; coins=[]; boots = []; magnets = [];
  caution_boards = []; player_legs=[];
  cones = []; speed_boosters = []; multipliers = [];
  var arr = [-3,0,3];
  game_ground = new ground(gl, [0, -0.1, 0],'media/ground.jpg');
  for(var i=6;i>=-600;i-=2){
    rails.push(new rail(gl, [3, -0.1, i],'media/rail.jpg'));
    rails2.push(new rail(gl, [-3, -0.1, i],'media/rail.jpg'));
    rails3.push(new rail(gl, [0, -0.1, i],'media/rail.jpg'));
  }
  for(var i=6;i>=-500;i-=5){
    wall1.push(new wall(gl, [5, 2.5, i],'media/wall.jpeg'));
    wall2.push(new wall(gl, [-5, 2.5, i],'media/wall.jpeg'));
  }
  player_legs.push(new legs(gl, [0, 0, 0],'media/black.png',1,40));
  player_legs.push(new legs(gl, [0, 0, 0],'media/black.png',1,-40));
  player_legs.push(new legs(gl, [0, 0, 0],'media/black.png',1,-40));
  player_legs.push(new legs(gl, [0, 0, 0],'media/black.png',1,40));
  player_legs.push(new legs(gl, [0, 0, 0],'media/brown.jpg',1,40));
  player_legs.push(new legs(gl, [0, 0, 0],'media/brown.jpg',1,-40));
  player_legs.push(new legs(gl, [0, 0, 0],'media/brown.jpg',1,-40));
  player_legs.push(new legs(gl, [0, 0, 0],'media/brown.jpg',1,40));

  //life boosters
  life_key = [];
  life_img = 'media/life.jpg'
  life_pos = [[-3,0.7,-10]]; // list of positions where life will be placed

  coins.push(new coin(gl, [0, 0.5, -30],'media/coin.png'));
  multipliers.push(new multiplier(gl, [0, 0.5, -40],'media/2xmul.png'));

  for(var i = -20;i>=-500;i-=50) trains.push(new train(gl, [-3, 1, i],'media/train.png')); 
  for(var i = -40;i>=-500;i-=50) trains.push(new train(gl, [3, 1, i],'media/train.png')); 
  for(var i = -80;i>=-500;i-=50) trains.push(new train(gl, [0, 1, i],'media/train.png')); 
  for(var i = -105;i>=-500;i-=30){
    var de = Math.floor(Math.random()*1000%30);
    if(de<10)caution_boards.push(new caution_board(gl, [0, 2, i],'media/caution.png'));
    else if(de<20) large_obstacles.push(new large_obs(gl, [0, 1.5, i],'media/board_sign.jpg'));
    else  small_obstacles.push(new small_obs(gl, [0, 0.6, i],'media/obs1.jpeg'));
  }
  for(var i=-110;i>=-500;i-=50){
    var de = Math.floor(Math.random()*1000%30);
    if(de==0){
      //red star
      life_pos.push([0,0.7,i-5]);
    }
    else if(de<3){
      //jetpack
      jetpacks.push(new jetpack(gl, [0, 0.7,i-5],'media/jetpack.png'));
      append_coins_after_jetpack(gl,i-5);
    }
    else if(de<8){
      //boots
      boots.push(new boot(gl, [0, 0.7,i-5],'media/boots.png'));
    }
    else if(de<13){
      //2x
      multipliers.push(new multiplier(gl, [0, 0.5, i-5],'media/2xmul.png'));
    }
    else if(de<16){
      //blue star
      speed_boosters.push(new speed_boost(gl, [0, 1, i-5],'media/speed_booster.png'));
    }
    else if(de<20){
      cones.push(new cone_obs(gl, [0, 1, i-10],'media/cone.png'));
    }
    else{
      //coin
      coins.push(new coin(gl, [0, 0.5, i],'media/coin.png'));
      coins.push(new coin(gl, [0, 0.5, i-2],'media/coin.png'));
      coins.push(new coin(gl, [0, 0.5, i-4],'media/coin.png'));
    }
  }
  for(var i=-37;i>=-500;i-=50){
    var de = Math.floor(Math.random()*1000%30)
    if(de<10)caution_boards.push(new caution_board(gl, [-3, 2, i],'media/caution.png'));
    else if(de<20) large_obstacles.push(new large_obs(gl, [-3, 1.5, i],'media/board_sign.jpg'));
    else  small_obstacles.push(new small_obs(gl, [-3, 0.6, i],'media/obs1.jpeg'));
  }
  for(var i=-40;i>=-500;i-=50){
    var de = Math.floor(Math.random()*1000%30);
    if(de==0){
      //red star
      life_pos.push([-3,0.7,i-5]);
    }
    else if(de<4){
      //jetpack
      jetpacks.push(new jetpack(gl, [-3, 0.7,i-5],'media/jetpack.png'));
      append_coins_after_jetpack(gl,i-5);
    }
    else if(de<10){
      //boots
      boots.push(new boot(gl, [-3, 0.7,i-5],'media/boots.png'));
    }
    else if(de<14){
      //2x
      multipliers.push(new multiplier(gl, [-3, 0.5, i-5],'media/2xmul.png'));
    }
    else if(de<18){
      //blue star
      speed_boosters.push(new speed_boost(gl, [-3, 1, i-5],'media/speed_booster.png'));
    }
    else{
      //coin
      coins.push(new coin(gl, [-3, 0.5, i],'media/coin.png'));
      coins.push(new coin(gl, [-3, 0.5, i-2],'media/coin.png'));
      coins.push(new coin(gl, [-3, 0.5, i-4],'media/coin.png'));
    }
    if(de<15){
      cones.push(new cone_obs(gl, [-3, 1, i-15],'media/cone.png'));
    }
  }
  for(var i=-65;i>=-500;i-=50){
    var de = Math.floor(Math.random()*1000%30)
    if(de<10)caution_boards.push(new caution_board(gl, [3, 2, i],'media/caution.png'));
    else if(de<20) large_obstacles.push(new large_obs(gl, [3, 1.5, i],'media/board_sign.jpg'));
    else  small_obstacles.push(new small_obs(gl, [3, 0.6, i],'media/obs1.jpeg'));
  }
  for(var i=-68;i>=-500;i-=50){
    var de = Math.floor(Math.random()*1000%30);
    if(de==0){
      //red star
      life_pos.push([3,0.7,i-5]);
    }
    else if(de<4){
      //jetpack
      jetpacks.push(new jetpack(gl, [3, 0.7,i-5],'media/jetpack.png'));
      append_coins_after_jetpack(gl,i-5);
    }
    else if(de<10){
      //boots
      boots.push(new boot(gl, [3, 0.7,i-5],'media/boots.png'));
    }
    else if(de<14){
      //2x
      multipliers.push(new multiplier(gl, [3, 0.5, i-5],'media/2xmul.png'));
    }
    else if(de<18){
      //blue star
      speed_boosters.push(new speed_boost(gl, [3, 1, i-5],'media/speed_booster.png'));
    }
    else{
      //coin
      coins.push(new coin(gl, [3, 0.5, i],'media/coin.png'));
      coins.push(new coin(gl, [3, 0.5, i-2],'media/coin.png'));
      coins.push(new coin(gl, [3, 0.5, i-4],'media/coin.png'));
    }
  }


  jetpacks.push(new jetpack(gl, [-3, 0.7, -1],'media/jetpack.png'));
  append_coins_after_jetpack(gl,-1);

  jetpacks.push(new jetpack(gl, [-3, 0.7, -100],'media/jetpack.png'));
  append_coins_after_jetpack(gl,-100);

  small_obstacles.push(new small_obs(gl, [3, 0.6, -3],'media/obs1.jpeg'));
  cones.push(new cone_obs(gl, [3, 1, -10],'media/cone.png'));
  speed_boosters.push(new speed_boost(gl, [0, 1, -15],'media/speed_booster.png'));
  speed_boosters.push(new speed_boost(gl, [0, 1, -110],'media/speed_booster.png'));
  speed_boosters.push(new speed_boost(gl, [0, 1, -180],'media/speed_booster.png'));
  for(var i=0;i<life_pos.length;++i){
    life_key.push(new boostlife(gl, [life_pos[i][0],life_pos[i][1]+0.3,life_pos[i][2]],life_img,72,life_pos[i]));//at top
    life_key.push(new boostlife(gl, [life_pos[i][0],life_pos[i][1],life_pos[i][2]],life_img,72,life_pos[i]));//at bottom
    life_key.push(new boostlife(gl, [life_pos[i][0]-0.1,life_pos[i][1]+0.15,life_pos[i][2]],life_img,-20,life_pos[i]));//left
    life_key.push(new boostlife(gl, [life_pos[i][0]+0.1,life_pos[i][1]+0.15,life_pos[i][2]],life_img,-20,life_pos[i]));//right
  }

  const vsSource = `
      attribute vec4 aVertexPosition;
      attribute vec2 aTextureCoord;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;

      varying highp vec2 vTextureCoord;

      void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;
      }
    `;
  // Fragment shader program
  const fsSource = `
        varying highp vec2 vTextureCoord;

        uniform sampler2D uSampler;

        void main(void) {
          gl_FragColor = texture2D(uSampler, vTextureCoord);
        }
      `;  
  const fsSource1 = `
      varying highp vec2 vTextureCoord;
      uniform sampler2D uSampler;
      precision mediump float;

      void main(void) {
        vec4 tex = texture2D(uSampler,vTextureCoord);
        float sum = (tex.x + tex.y + tex.z)/3.0;
        gl_FragColor = vec4(sum, sum,sum,1);
      }
    `;
  const fsSource2 = `
      varying highp vec2 vTextureCoord;
      uniform sampler2D uSampler;
      precision mediump float;

      void main(void) {
        vec4 tex = texture2D(uSampler,vTextureCoord);
        tex.x *= 1.5; tex.y *= 1.5; tex.z *= 1.5;
        gl_FragColor = vec4(tex.x, tex.y,tex.z,1);
      }
    `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const shaderProgram1 = initShaderProgram(gl, vsSource, fsSource1);
  const shaderProgram2 = initShaderProgram(gl, vsSource, fsSource2);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };

  const programInfo1 = {
    program: shaderProgram1,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram1, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram1, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram1, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram1, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram1, 'uSampler'),
    },
  };

  const programInfo2 = {
    program: shaderProgram2,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram2, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram2, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram2, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram2, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram2, 'uSampler'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  //const buffers

  var then = 0;

  function tick_elements(){
    // handle jet propulsion
    if(jet_boost == true){
      speed_booster = false;
      jet_count += 1;
      if(jet_count >= jet_duration) {
        jet_boost = false;
        console.log(c.pos[2]);
      }
    }

    // cam speed is updated here;
    if(jet_boost==true){
        cam_speed = 0.5;
        c.pos[1]=6; // gap of "3.5" between cube bottom and train top
    }
    else if(speed_booster == true){
      speed_boost_count += 1;
      if(speed_boost_count >= speed_boost_duration) speed_booster = false;
      else cam_speed = 0.25;
    } 
    else{
      cam_speed = 0.125;
    } 
    //based on player is hit or not cam_speed might be halved or modified whatever
    if(collided_somewhere == true && !jet_boost){
      col_time_count += 1;
      if(col_time_count <col_esc_time ){
        c.move_forward(cam_speed/3);
        if(!on_train && !jet_boost && c.pos[1]>0.75) c.move_forward(0.65*cam_speed);
        pol.pos[2] = c.pos[2]+3; pol.pos[0] = c.pos[0]; pol.pos[1] = c.pos[1];
      }
      else{
        collided_somewhere = false;
        col_time_count = 0;
        pol.move_forward(cam_speed/3);
        c.move_forward(cam_speed);
        if(!on_train && !jet_boost && c.pos[1]>0.75) c.move_forward(0.65*cam_speed);
      }
    }
    else{
      pol.move_forward(cam_speed/3);
        c.move_forward(cam_speed);
        if(!on_train && !jet_boost && c.pos[1]>0.75) c.move_forward(0.65*cam_speed);
    }

    //######################################################################### 
    //jumping with boots
    if(boot_jump == true) boot_count += 1;
    if(boot_count >= boot_duration) boot_jump = false;
    if(boot_jump==true) c.maxup = 5;
    else c.maxup = 2.5;

    // if(on_train) c.maxup += 2;

    // handling up down movement
    if(!jet_boost && !on_train){
      if(upPressed == true) c.go_up = true;
      if(downPressed == true){
        c.go_up = false;
      }
      if(c.go_up==true){
        c.move_up();
      }
      else{
        c.apply_gravity(downPressed);
      }
    }
    
    //Handling horizontal movement -> player moves on -3,0,3 only
    if(c.speedx == 0){
      /*it will be only when block is at a certain position -> -3,0,3 only
        else this block is ignored and it will first move till that position*/
      if(leftPressed == true){
        c.present_x = c.pos[0];
        c.dest_x = get_left_destx(c.pos[0]);
        c.speedx = -0.4;
      }
      if(rightPressed == true){
        c.present_x = c.pos[0];
        c.dest_x = get_right_destx(c.pos[0]);
        c.speedx = 0.4;
      }
    }
    if(c.speedx <0) c.move_left();
    else if(c.speedx >0) c.move_right();

    //restoring back to initial state
    rightPressed = false;
    leftPressed = false;
    upPressed = false;
  }

  function check_collisions(){
    //player with bonus -> coins, jetpack, boots, magnet, life
    for (var i = 0; i < coins.length;) {
      if(detect_collision(coins[i].bounding_box(), c.bounding_box())!=0){
        c.score += 2;
        coins.splice(i,1);
      }
      else ++i;
    }
    for (var i = 0; i < multipliers.length;) {
      if(detect_collision(multipliers[i].bounding_box(), c.bounding_box())!=0){
        c.score *= 2;
        multipliers.splice(i,1);
      }
      else ++i;
    } 
    for (var i = 0; i < life_pos.length;) {
      var flag = 0;
      if(Math.abs(life_pos[i][0]-c.pos[0]) <= c.width + 0.3) ++flag;
      if(Math.abs(life_pos[i][1]-c.pos[1]) <= c.height + 0.1) ++flag;
      if(Math.abs(life_pos[i][2]-c.pos[2]) <= c.depth + 0.05) ++flag;

      if(flag==3){
        c.lives += 1;
        for(var j=0;j< life_key.length;){
          if(life_key[j].extras == life_pos[i]){
              life_key.splice(j,4);
              break;
          }
          else j+=4;
        }
        life_pos.splice(i,1);
      }
      else ++i;
      if(flag==3) break;
    }
    for (var i = 0; i < boots.length;){
      if(detect_collision(boots[i].bounding_box(), c.bounding_box())!=0){
        boots.splice(i,1);
        boot_jump = true;
        boot_count = 0;
      }
      else ++i;
    }
    for (var i = 0; i < jetpacks.length;) {
      if(detect_collision(jetpacks[i].bounding_box(), c.bounding_box())!=0){
        jetpacks.splice(i,1);
        jet_boost = true;
        jet_count = 0;
      }
      else ++i;
    }
    for (var i = 0; i < speed_boosters.length;) {
      if(detect_collision(speed_boosters[i].bounding_box(), c.bounding_box())!=0){
        speed_boosters.splice(i,1);
        speed_booster = true;
        speed_boost_count = 0;
      }
      else ++i;
    }
    for (var i = 0; i < magnets.length;) {
      if(detect_collision(magnets[i].bounding_box(), c.bounding_box())!=0){
        magnets.splice(i,1);
      }
      else ++i;
    }

    //player with enemies -> small obstacle, train
    for (var i = 0; i < caution_boards.length; ++i) {
      if(detect_collision(caution_boards[i].bounding_box(), c.bounding_box())!=0){
        if(collided_somewhere == true){
          c.lives -= 1;
          c.life_dec = true;
          return;
        }
        else{
          c.pos[2] -= 2;
          collided_somewhere = true;
        }
      }
    }
    for (var i = 0; i < cones.length;) {
      if(detect_collision(cones[i].bounding_box(), c.bounding_box())!=0){
        cones.splice(i,1);
        if(collided_somewhere == true){
          c.lives -= 1;
          c.life_dec = true;
          return;
        }
        else{
          c.pos[2] -= 2;
          collided_somewhere = true;
        }
      }
      else ++i;
    }
    for (var i = 0; i < small_obstacles.length; ++i) {
      if(detect_collision(small_obstacles[i].bounding_box(), c.bounding_box())!=0){
        c.lives -= 1;
        c.life_dec = true;
        return;
      }
    }
    for (var i = 0; i < large_obstacles.length; ++i) {
      if(detect_collision(large_obstacles[i].bounding_box(), c.bounding_box())!=0){
        c.lives -= 1;
        c.life_dec = true;
        return;
      }
    }
    // on_train = false;
    for (var i = 0; i < trains.length; ++i) {
      var a =trains[i].bounding_box(), b=c.bounding_box();
      if(detect_collision2(a, b)!=0){
        if(a.y + a.height < b.y){
          c.pos[1] = 2.5;
          on_train = true;
        }
        else{
          c.lives -= 1;
          c.life_dec = true;
          return;
        }
      }
      else{
        on_train = false;
      }
    }
  }

  // Draw the scene repeatedly
  function render(now) {
      now *= 0.001; // convert to seconds
      const deltaTime = now - then;
      then = now;
      if(c.pos[2]<=-500){
        if(!alert("Congratulations!! Game Completed.\nRefresh page to start again."))
        window.location.reload();
      }
      if(c.lives == 0){
        if(!alert("Game is over!!\n Refresh page to start again."))
        window.location.reload();
      }
      else if(c.life_dec){
        respawn_setting();
        alert("You lost a life! Press OK to Respawn....");
      }
      if(greyscaleP){
        drawScene(gl, programInfo1, deltaTime);
      }
      else{
        drawScene(gl, programInfo, programInfo2, deltaTime);
      }
      var element = document.getElementById("player_score");
      element.innerHTML = c.score;
      element = document.getElementById("player_lives");
      element.innerHTML = c.lives;
      cam_speed += 0.0001;
      c.life_dec = false;
      check_collisions();
      tick_elements();
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

//
// Draw the scene.
//
function drawScene(gl, programInfo, programInfo2, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = (60 * Math.PI) / 180; // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 10000.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  var cameraMatrix = mat4.create();
  mat4.translate(cameraMatrix, cameraMatrix, [2, 5, 0]);
  var cameraPosition = [c.pos[0], 2+c.pos[1], c.pos[2] + 5];
  // var cameraPosition = [c.pos[0], 2.5+c.pos[1], c.pos[2] + 5];

  var up = [0, 1, 0];

 //Generates a look-at matrix with the given eye position, focal point, and up axis
 //out mat4 frustum matrix will be written into
 //eye Position of the viewer
 //center Point the viewer is looking at
 //up vec3 pointing up
  mat4.lookAt(cameraMatrix, cameraPosition, c.pos, up);

  var viewMatrix = cameraMatrix; //mat4.create();

  var viewProjectionMatrix = mat4.create();

  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

  // write the objects to be drawn here
  if(!jet_boost) c.type += 1;
  var leg_type = (boot_jump == true)? 1:0;
  if(c.type % 6 < 3){
    player_legs[4*leg_type].pos[0] = c.pos[0]-0.15;
    player_legs[4*leg_type].pos[1] = c.pos[1]-2*c.height;
    player_legs[4*leg_type].pos[2] = c.pos[2];
    player_legs[4*leg_type+1].pos[0] = c.pos[0]+0.15;
    player_legs[4*leg_type+1].pos[1] = c.pos[1]-2*c.height;
    player_legs[4*leg_type+1].pos[2] = c.pos[2];
    player_legs[4*leg_type].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    player_legs[4*leg_type+1].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  }
  else{
    player_legs[4*leg_type+2].pos[0] = c.pos[0]-0.15;
    player_legs[4*leg_type+2].pos[1] = c.pos[1]-2*c.height;
    player_legs[4*leg_type+2].pos[2] = c.pos[2];
    player_legs[4*leg_type+3].pos[0] = c.pos[0]+0.15;
    player_legs[4*leg_type+3].pos[1] = c.pos[1]-2*c.height;
    player_legs[4*leg_type+3].pos[2] = c.pos[2];
    player_legs[4*leg_type+2].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    player_legs[4*leg_type+3].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  }
  c.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  pol.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  
  for(var i=0; i<rails.length; ++i){
    // rails[i].pos[2] -= 1; rails2[i].pos[2] -= 1; rails3[i].pos[2] -= 1;
    rails[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    rails2[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
    rails3[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  }
  if(flashing == true)flash_count += 1;
  for(var i=0; i<wall1.length; i++){
      if(flashing == true && flash_count%30 <15){
        wall1[i].draw(gl, viewProjectionMatrix, programInfo2, deltaTime);
        wall2[i].draw(gl, viewProjectionMatrix, programInfo2, deltaTime);  
      }
      else{
        wall1[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
        wall2[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
      }
  }
  for(var i=0;i<trains.length;i++){
    trains[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  }

  for(var i=0;i<small_obstacles.length;i++){
    small_obstacles[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  }
  for(var i=0;i<large_obstacles.length;i++){
    large_obstacles[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  }

  for(var i=0;i<jetpacks.length;i++){
    jetpacks[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  }
  for(var i=0;i<multipliers.length;i++){
    multipliers[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  }
  for(var i=0;i<boots.length;i++){
    boots[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  }
  for(var i=0;i<magnets.length;i++){
    magnets[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  }
  for(var i=0;i<life_key.length;++i){
    life_key[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  }
  for(var i=0;i<coins.length;i++){
    coins[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  }
  for(var i=0;i<caution_boards.length;i++){
    caution_boards[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  }
  for(var i=0;i<cones.length;i++){
    cones[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  }
  for(var i=0;i<speed_boosters.length;i++){
    speed_boosters[i].draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  }
  game_ground.draw(gl, viewProjectionMatrix, programInfo, deltaTime);
  //c1.drawCube(gl, projectionMatrix, programInfo, deltaTime);
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(shaderProgram)
    );
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      "An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn off mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}


function get_left_destx(value){
  if(value == 3)return 0;
  return -3;
}

function get_right_destx(value){
  if(value == -3)return 0;
  return 3;
}

function detect_collision(a, b){
  // assuming two cuboids are given as inputs
  var ret = 0;
  if(Math.abs(a.x-b.x) <= a.width + b.width){
    ++ret;
  }
  if(Math.abs(a.y-b.y) <= a.height + b.height){
    ++ret;
  }
  if(Math.abs(a.z-b.z) <= a.depth + b.depth){
    ++ret;
  }
  if(ret==3) return 1;
  return 0;
}

function detect_collision2(a, b){
  // assuming two cuboids are given as inputs
  var ret = 0;
  if(Math.abs(a.x-b.x) <= a.width + b.width+0.1){
    ++ret;
  }
  if(Math.abs(a.y-b.y) <= a.height + b.height+0.1){
    ++ret;
  }
  if(Math.abs(a.z-b.z) <= a.depth + b.depth+0.1){
    ++ret;
  }
  if(ret==3) return 1;
  return 0;
}


function respawn_setting(){
  //player and police back to start
  c.pos[0] = 0;
  c.pos[1] = 0.75;
  c.pos[2] = 3;
  c.go_up = false;
  c.present_x = 0;
  c.dest_x = 0;
  pol.pos[0] = 0;
  pol.pos[1] = 0.75;
  pol.pos[1] = 20;
  //movement directions
  rightPressed = false;
  leftPressed = false;
  upPressed = false;
  
  //reset shaders
  greyscaleP = false;
  flashing = false;
  
  //boosts and other things
  on_train = false;
  jet_boost = false;
  speed_booster = false;
  boot_jump = false;
  collided_somewhere = false;
  col_time_count = 0;
}