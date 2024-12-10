<template>
  


  <div class="rightcontainer">
    <div class="user-view p-4"></div>
  </div>

  <div class="lefttopcontainer">
    <div class="user-view p-5"></div>
  </div>

  <div class="leftbottomcontainer">
    <div class="user-view p-6"></div>
  </div>

  
  
    
    

  <div class="background"></div>
</template>

<script>
export default {
  name: 'UserView',
};
</script>

<style scoped>
.background {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #707070;
  z-index: -999999;  
}

.user-view {
  background-color: white;
  border-radius: 30px;
}

.p-4 {
  position: absolute;
  height: 90%;
  width: 90%;
}

.p-5 {
  position: absolute;
  height: 95%;
  width: 60%;
}

.p-6 {
  position: absolute;
  height: 90%;
  width: 95%;
}

.rightcontainer {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.lefttopcontainer {
  position: absolute;
  left: 0;
  margin-left: 80px;
  top: 0;
  height: 40%;
  width: 45%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.leftbottomcontainer {
  position: absolute;
  left: 0;
  margin-left: 80px;
  bottom: 0;
  height: 60%;
  width: 45%;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
