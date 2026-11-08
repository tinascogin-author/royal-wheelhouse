import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSoundSystem,wheelClickTimes} from './sounds.js';
test('wheel clicks follow the visual easing, with longer intervals toward the stop',()=>{
  const times=wheelClickTimes(2000,5600);assert.ok(times.length>50);assert.ok(times.every((t,i)=>t>0&&t<5600&&(!i||t>times[i-1])));
  assert.ok(times.at(-1)-times.at(-2)>(times[1]-times[0])*5);
});
test('mute cancels scheduled effects and active voices; unmute does not autoplay',()=>{
  const tasks=new Map(),voices=[];let next=0;
  const param={setValueAtTime(){},exponentialRampToValueAtTime(){}};
  class FakeAudioContext{state='running';currentTime=0;destination={};resume(){return Promise.resolve();}createOscillator(){const v={frequency:param,connect(){},start(){},stop(){this.stopped=true;},disconnect(){}};voices.push(v);return v;}createGain(){return {gain:param,connect(){},disconnect(){}};}}
  const env={AudioContext:FakeAudioContext,setTimeout(fn,ms){tasks.set(++next,{fn,ms});return next;},clearTimeout(id){tasks.delete(id);}};
  const sound=createSoundSystem(true,env);sound.start('Words',5600,2000);assert.ok(tasks.size>50);
  [...tasks.values()][0].fn();assert.equal(voices.length,1);
  sound.setEnabled(false);assert.equal(tasks.size,0);assert.ok(voices.every(v=>v.stopped));sound.start('Poisons',4700);assert.equal(tasks.size,0);
  sound.setEnabled(true);assert.equal(tasks.size,0);sound.reveal('Tarot');assert.equal(tasks.size,4);sound.stop();assert.equal(tasks.size,0);
});
