import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export default class Result {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created: Date;

    @CreateDateColumn()
    updated: Date;

    @Column({
        length: 300,
        default: 'prodcut name'
    })
    product_name: string;

    @Column({length: 100})
    product_type: string;

    @Column({
        length:200,
        default: 'brand'
    })
    product_brand: string;

    @Column({
        length:500,
        default: 'link'
    })
    product_link: string;

    @Column({
        default: 0
    })
    product_price: number;

    @Column({length: 500, default: 'product image link'})
    product_thumbnail: string;

    @Column({length: 1000, default: 'closing remark separated by | '})
    closing_remark: string

    @Column({length: 1000,nullable: true})
    alternate_result: string;

    @Column({length:500, default: 'keywords'})
    keywords: string;
    
}