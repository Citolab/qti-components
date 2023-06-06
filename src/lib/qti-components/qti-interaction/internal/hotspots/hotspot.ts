import { QtiHotspotChoice } from '../../qti-hotspot-choice';

export function positionHotspots(
  shape: string,
  coordsNumber: number[],
  img: HTMLImageElement,
  hotspot: QtiHotspotChoice
) {
  switch (shape) {
    case 'circle':
      {
        const [centerX, centerY, radius] = coordsNumber;
        const centerXPer = (centerX / img.width) * 100;
        const centerYPer = (centerY / img.height) * 100;
        const radiusPer = (radius / img.width) * 100;
        hotspot.style.left = centerXPer - radiusPer + '%';
        hotspot.style.top = centerYPer - radiusPer + '%';
        hotspot.style.width = hotspot.style.height = 4 * radiusPer + 'px';
        hotspot.style.borderRadius = `9999px`;
      }
      break;

    case 'rect':
      {
        const [leftX, topY, rightX, bottomY] = coordsNumber;
        const leftXPer = (leftX / img.width) * 100;
        const topYPer = (topY / img.height) * 100;
        const rightXPer = (rightX / img.width) * 100;
        const bottomYPer = (bottomY / img.height) * 100;
        hotspot.style.left = leftXPer + '%';
        hotspot.style.top = topYPer + '%';
        hotspot.style.width = rightXPer - leftXPer + '%';
        hotspot.style.height = bottomYPer - topYPer + '%';
      }
      break;

    case 'poly':
      {
        // from a,b,c,d,e,f => [{x:a, y:b},{x:c, y:d},{x:e, y:f}]
        const polycoords = coordsNumber.reduce((acc, currentValue, currentIndex, polyC) => {
          if (currentIndex % 2 === 1) {
            const lastVal = acc.pop();
            acc[acc.length] = { x: lastVal, y: polyC[currentIndex] };
          } else {
            acc.push(currentValue);
          }
          return acc;
        }, []);

        // calculate bounding box by finding the max ax min coordinates of x and y
        const leftX = Math.min(...polycoords.map(point => point.x));
        const rightX = Math.max(...polycoords.map(point => point.x));
        const topY = Math.min(...polycoords.map(point => point.y));
        const bottomY = Math.max(...polycoords.map(point => point.y));

        // calculate the relative distance cause we want to use percentages
        const leftXPer = (leftX / img.width) * 100;
        const topYPer = (topY / img.height) * 100;
        const rightXPer = (rightX / img.width) * 100;
        const bottomYPer = (bottomY / img.height) * 100;

        // set the hotspot on x,y and set the width and height in percentages
        hotspot.style.left = (leftX / img.width) * 100 + '%';
        hotspot.style.top = (topY / img.height) * 100 + '%';
        hotspot.style.width = rightXPer - leftXPer + '%';
        hotspot.style.height = bottomYPer - topYPer + '%';

        // all the polygon points should be corrected caused they are from
        // image 0,0 point, and should be from the hotspot point which already
        // has been offsetted from the image in the previous few lines of code
        // also the points have a relative distance to the image, but now have
        // to have a relative distance from the width of the hotspot
        const polygonData = polycoords.map(point => ({
          x: ((point.x - leftX) / (rightX - leftX)) * 100,
          y: ((point.y - topY) / (bottomY - topY)) * 100
        }));

        // create clip path coordinate style in percentages
        const polyD = polygonData.map(p => Math.round(p.x) + '% ' + Math.round(p.y) + '%').join(',');

        // 50% 0%, 100% 50%, 50% 100%, 0% 50%
        hotspot.style.clipPath = `polygon(${polyD})`;
      }
      break;

    default:
      break;
  }
}
