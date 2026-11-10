export const palaceThemes={
 classic:{name:'Royal Classic',description:'Purple velvet, candlelight, and the original royal sparkle.',image:'assets/palace.png'},
 christmas:{name:'Christmas',description:'Evergreen garlands, twinkling lights, a jeweled tree, and winter magic.',image:'assets/palace-christmas.png'},
 halloween:{name:'Halloween',description:'Glowing pumpkins, cobwebs, moonlit bats, and enchanted autumn mist.',image:'assets/palace-halloween.png'}
};
export const palaceTheme=value=>Object.hasOwn(palaceThemes,value)?value:'classic';
