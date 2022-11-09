import { Button as ButtonNativeBase, Text, IButtonProps } from 'native-base'

interface Props extends IButtonProps {
    title: string;
    // type pra definir o tipo do botão
    type?: 'PRIMARY' | 'SECONDARY';
}

export function Button({ title, type = 'PRIMARY', ...rest }: Props){
    return (
        // rest é pra todos os outros atributos que não foram definidos
        <ButtonNativeBase 
            w="full"
            h={14}
            rounded="sm"
            fontSize="md"
            textTransform="uppercase"
            bg={type === 'SECONDARY'? 'red.500' : 'yellow.500'}
            _pressed={{
                bg: type === 'SECONDARY'? 'red.600' : 'yellow.600'
            }}
            _loading={{
                _spinner: {color: 'black'}
            }}

            {...rest}
        > 
            <Text
                fontSize="sm"
                fontFamily="heading"
                color={type === 'SECONDARY'? 'white' : 'black'}
            >
                {title}
            </Text>
        </ButtonNativeBase>
    );
}