<script>
// @ts-nocheck

    import { onMount, createEventDispatcher } from "svelte";
  
    /**
     * @type number
     */
    export let id;
    /**
     * @type any
     */
    let card;
    
    
    let dispatch = createEventDispatcher();

    onMount(() => {
      card = document.querySelector(`.swipe-card-${id}`);
    });
  
    // delete card
    const handleDelete = (/** @type {number} */ id) => {
      dispatch("delete-card", id);
    };
  
    /**
     * @type any
    */
    let startX;
    /**
     * @type any
    */
    let startY;
    /**
   * event that happens when the user touches a card
	 * @param {{ touches: { clientX: any; }[]; }} event
	 */
    function handleTouchStart(event) {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      card.style.transition = "none";
    }
  
    let isScrolling = false;
  /**
   * swipe motion when user moves the card
	 * @param {{ touches: { clientX: any; }[]; }} event
	 */
    function handleTouchMove(event) {
      const currentX = event.touches[0].clientX;
      const currentY = event.touches[0].clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      // Calculate the absolute values of deltaX and deltaY
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Only allow horizontal swipes if the horizontal movement is greater than vertical movement
      if (absDeltaX > absDeltaY && absDeltaX > 10) {
        // event.preventDefault(); // Prevent vertical scrolling while swiping horizontally
        card.style.transform = `translateX(${deltaX}px)`;
      }else {
        isScrolling = true;
        card.style.transition = "none";
        card.style.transform = "translateX(0)"; 
      }
    }
  
  /**
   * delete the card after the card crosses a certain point left or right
	 * @param {{ changedTouches: { clientX: any; }[]; }} event
	 */
    function handleTouchEnd(event) {
      const endX = event.changedTouches[0].clientX;
      const deltaX = endX - startX;

      if (!isScrolling){
        if (deltaX < -50) {
          // Swipe left, smoothly transition to the left
          card.style.transition = "transform 0.3s ease";
          card.style.transform = `translateX(-100%)`;
    
          // Trigger delete after the transition is complete
          setTimeout(() => {
            handleDelete(id);
            resetCardTransform();
          }, 300);
        } else if (deltaX > 50) {
          // Swipe right, smoothly transition to the right
          card.style.transition = "transform 0.3s ease";
          card.style.transform = `translateX(100%)`;
    
          // Trigger delete after the transition is complete
          setTimeout(() => {
            handleDelete(id);
            resetCardTransform();
          }, 300);
        } else {
          // Reset position if not swiped far enough
          card.style.transition = "transform 0.3s ease";
          card.style.transform = "translateX(0)";
        }
      }else{
        card.style.transition = "none"
        card.style.transform = "translateX(0)";
      }
      
      isScrolling = false;
    }
  
    function resetCardTransform() {
      card.style.transition = "none";
      card.style.transform = "translateX(0)";
    }
  </script>
  
<ion-card
    class="swipe-card swipe-card-{id}"
    on:touchstart={handleTouchStart}
    on:touchmove={handleTouchMove}
    on:touchend={handleTouchEnd}
  >
    <slot></slot>
</ion-card>
  
  <style>
    .swipe-card {
      margin: 0;
      padding: 1rem;
      transition: transform 0.3s ease;
    }
  </style>
  