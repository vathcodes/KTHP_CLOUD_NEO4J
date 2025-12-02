import React from 'react'
import './ExploreMenu.css'
import { menu_list } from '../../assets/assets'

const ExploreMenu = ({category, setCategory}) => {


  return (
    <div className='explore-menu' id='explore-menu'>
        <h1>Thực đơn của chúng tôi</h1>
        <p className='explore-menu-text'>Lựa chọn từ thực đơn đa dạng với vô vàn món ăn hấp dẫn. Thỏa mãn cơn thèm ăn và nâng tầm trải nghiệm ẩm thực của bạn, từng bữa ăn ngon miệng một..</p>
        <div className="explore-menu-list">
            {menu_list.map((item,index)=>{
                return (
                    <div onClick={()=>setCategory(prev=>prev===item.menu_name?"All":item.menu_name)} key={index} className='explore-menu-list-item'>
                        <img className={category===item.menu_name?"active":""} src={item.menu_image} alt="" />
                        <p>{item.menu_name}</p>
                    </div>
                )
            })}
        </div>
        <hr />
    </div>
  )
}

export default ExploreMenu
