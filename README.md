# My-portfolio-launching-soon
@codex_portfolio
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>codex portfolio</title>
</head>
<style>
  body{
    display:flex;
    align-items: center;
    justify-content: center;
    margin:0;
    background:#000;
    height:100vh;
  }
  .border{
    display:flex;
    position:relative;
    align-items: center;
    justify-content: center;
    background:#000;
    overflow: hidden ;
    flex-direction: column;
    width:500px;
    height:300px;
    border-radius: 10px;
  }
  .border::before{
    content:'';
    position: absolute;
    inset:0;
    background-size: 400% 400%;
    padding: 3px;
    background:linear-gradient(
    90deg
    ,#ffffff
    ,#f00f00
    ,#0ff0ff
    ,#0f0f0f
    ,#afdafd
    ,#dddddd
    ,#ffffff
    );
    -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: bordermove 6s linear infinite;
    border-radius:10px;
  }
  @keyframes bordermove {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100%
      50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  .circle{
    width:250px;
    height:150px;
    z-index:2;
    flex-direction: column;
    border:2px solid #fff;
    border-radius: 100px;
    transform:translateY(10px);
    display: flex;
    position: relative;
    overflow: hidden;
  }
  text{
    animation:draw 6s ease forwards;
  }
  
     svg{
      z-index:2;
      transform: translateY(-160px);
    }
  @keyframes draw{
    to{stroke-dashoffset:0;}
  }
  .button{
    width:100px;
    height:20px;
    border-radius:50px;
    border:2px solid #fff;
    transform:translateY(75px);
    color:#f00;
    text-transform:uppercase;
    font-size: 0.9em;
    font-weight: bold;
  }
  .button:hover{
    background:#000;
    color:#fff;
  }
  .fade{
    color:red;
    text-transform:uppercase;
    animation:fadeup 2s ease forwards;
    opacity: 0;
    transform: translateY(5px);
    font-size:1em;
    animation-delay: 6s;
    font-weight: bold;
  }
  @keyframes fadeup{
    to{
      opacity:1;
      transform:translateY(30px);
    }
  }
  .write{
    color:#fff;
    font-size: 1.2em;
   white-space: nowrap;
  border-right: 2px ;
  animation:typing 5s steps(30,end);
 overflow:hidden;
transform:translateY(5px);
text-transform: uppercase;
font-weight: bold;
  }
  @keyframes typing{
    from{width:0;
      opacity:0;
    }
    to{width:73.5%;
    opacity: 1;}
  }
  .circle img{
    width:100%;
    height:250%;
    object-fit: cover;
    display: block;
  }
.portal{
  color:#f00;
  transform: translateY(100px);
  text-transform: uppercase;
  font-size: 1.2em;
  font-weight: bold;
  opacity: 1;
  animation:fades 3s ease forwards;
}

  @keyframes fades{
    to{
      opacity:1;
      transform:translateY(2px);
    }
  }
</style>
<body>
  <div class="border">
    <div class="circle">
     <img src="/Screenshot_20250908-202100_1.png" alt="profile">
    </div>
    
    <button class="button" type="submit">see my work</button>
    
    <p class="write">expressing life through code.</p>
    <p class="fade">web dev
    🔸designer🔸creator</p>
  <p class="portal">codex access portal</p>
  </div>
</body>

</html>
